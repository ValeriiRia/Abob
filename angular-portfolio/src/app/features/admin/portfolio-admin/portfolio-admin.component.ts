import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxTextAreaModule } from 'devextreme-angular'; // [2, 3]
import CustomStore from 'devextreme/data/custom_store'; // [4, 1]
import { SupabaseService } from '../../../core/services/supabase'; // [5] (Проверьте, что путь верный)

@Component({
  selector: 'app-portfolio-admin',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxTextAreaModule], // [2, 3]
  templateUrl: './portfolio-admin.component.html',
})
export class PortfolioAdminComponent implements OnInit { // Реализуем OnInit
  supabase = inject(SupabaseService);
  dataSource: CustomStore; // [4]

  constructor() {
    //
    // ИСПРАВЛЕНИЕ: Вся логика CustomStore (включая 'load', 'insert' и т.д.)
    // ДОЛЖНА быть ВНУТРИ объекта, передаваемого в 'new CustomStore'.
    //
    this.dataSource = new CustomStore({ // [4, 1]
      key: 'id', // Укажем ключ для операций update/delete

      /**
       * LOAD (Чтение)
       */
      load: async (loadOptions: any) => { // [1]
        const { data, error } = await this.supabase.getProjects(); // [5, 6]
        if (error) {
          console.error('Ошибка загрузки:', error);
          throw new Error('Ошибка загрузки данных');
        }
        return data;
      },

      /**
       * INSERT (Создание)
       */
      insert: async (values: any) => { // [1]
        const { data, error } = await this.supabase.createProject(values); // [5, 7]
        if (error ||!data) {
          console.error('Ошибка создания:', error);
          throw new Error('Ошибка создания записи');
        }
        return data;
      },

      /**
       * UPDATE (Обновление)
       */
      update: async (key: any, values: any) => { // [1]
        const { data, error } = await this.supabase.updateProject(key, values); // [5, 8]
        if (error ||!data) {
          console.error('Ошибка обновления:', error);
          throw new Error('Ошибка обновления записи');
        }
        return data;
      },

      /**
       * REMOVE (Удаление)
       */
      remove: async (key: any) => { // [1]
        const { error } = await this.supabase.deleteProject(key); // [5, 9]
        if (error) {
          console.error('Ошибка удаления:', error);
          throw new Error('Ошибка удаления записи');
        }
      }
    }); // <-- Закрывающая скобка для new CustomStore()
  } // <-- Закрывающая скобка для constructor()

  //
  // ИСПРАВЛЕНИЕ: Добавлен недостающий метод 'ngOnInit', 
  // который требовал интерфейс 'OnInit'.
  //
  ngOnInit(): void { 
    // ngOnInit() теперь существует, ошибка "incorrectly implements" исчезнет.
  }

  // Этот метод нужен для RLS-политики INSERT
  async onInitNewRow(e: any) {
    try {
      // Получаем ID текущего пользователя из Supabase Auth
      const { data: { user } } = await this.supabase.supabase.auth.getUser(); // [5]
      if (user) {
        // Внедряем 'user_id' в данные новой строки
        e.data.user_id = user.id; 
      } else {
        console.error('Пользователь не аутентифицирован, создание невозможно.');
        e.cancel = true; // Отменяем создание строки
      }
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      e.cancel = true;
    }
  }
}