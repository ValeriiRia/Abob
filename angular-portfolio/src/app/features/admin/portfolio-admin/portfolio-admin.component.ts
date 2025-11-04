import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
//
// ИСПРАВЛЕНИЕ: Добавляем isPlatformBrowser и CommonModule
//
import { isPlatformBrowser, CommonModule } from '@angular/common'; 
//
// ИСПРАВЛЕНИЕ: Добавляем модули DevExtreme, которые используются в шаблоне
//
import { DxDataGridModule, DxTextAreaModule } from 'devextreme-angular'; 
import CustomStore from 'devextreme/data/custom_store'; // [3]
//
// ИСПРАВЛЕНИЕ: Используем правильный относительный путь к сервису
//
import { SupabaseService } from '../../../core/services/supabase'; // 

@Component({
  selector: 'app-portfolio-admin',
  standalone: true,
  //
  // --- ВОТ ИСПРАВЛЕННЫЙ IMPORTS: ---
  //
  imports: [CommonModule, DxDataGridModule, DxTextAreaModule],
  templateUrl: './portfolio-admin.component.html',
  styleUrls: ['./portfolio-admin.component.scss'] // 
})
export class PortfolioAdminComponent implements OnInit { 
  supabase = inject(SupabaseService);
  dataSource: CustomStore; // [3]

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log('PortfolioAdminComponent: КОНСТРУКТОР. Компонент создан.');
    
    //
    // ИСПРАВЛЕНИЕ: Убраны все маркеры [3] из объекта
    //
    this.dataSource = new CustomStore({ // [3]
      key: 'id', 

      load: async (loadOptions: any) => { // [3]
        if (isPlatformBrowser(this.platformId)) {
          console.log('PortfolioAdminComponent: CustomStore load() вызван.');
          const { data, error } = await this.supabase.getProjects(); // 
          if (error) {
            console.error('Admin Ошибка загрузки:', error);
            throw new Error('Ошибка загрузки данных');
          }
          console.log('PortfolioAdminComponent: CustomStore данные получены:', data);
          return data;
        }
        console.log('PortfolioAdminComponent: CustomStore load() вызван на СЕРВЕРЕ (SSR). Пропускаю.');
        return; // На сервере возвращаем пустой массив
      },

      insert: async (values: any) => { // [3]
        console.log('PortfolioAdminComponent: CustomStore insert() вызван.', values);
        const { data, error } = await this.supabase.createProject(values); // 
        if (error ||!data) {
          console.error('Admin Ошибка создания:', error);
          throw new Error('Ошибка создания записи');
        }
        return data;
      },

      update: async (key: any, values: any) => { // [3]
        console.log('PortfolioAdminComponent: CustomStore update() вызван.', key, values);
        const { data, error } = await this.supabase.updateProject(key, values); // 
        if (error ||!data) {
          console.error('Admin Ошибка обновления:', error);
          throw new Error('Ошибка обновления записи');
        }
        return data;
      },

      remove: async (key: any) => { // [3]
        console.log('PortfolioAdminComponent: CustomStore remove() вызван.', key);
        const { error } = await this.supabase.deleteProject(key); // 
        if (error) {
          console.error('Admin Ошибка удаления:', error);
          throw new Error('Ошибка удаления записи');
        }
      }
    }); 
  } 

  ngOnInit(): void { 
    console.log('PortfolioAdminComponent: ngOnInit() СТАРТ. Этот лог доказывает, что authGuard вас пропустил.');
  }

  // Этот метод нужен для RLS-политики INSERT
  async onInitNewRow(e: any) {
    console.log('PortfolioAdminComponent: onInitNewRow() вызван.');
    try {
      const { data: { user } } = await this.supabase.getUser(); // 
      if (user) {
        e.data.user_id = user.id; 
      } else {
        console.error('Admin Ошибка: Пользователь не аутентифицирован, onInitNewRow не может добавить user_id.');
        e.cancel = true; 
      }
    } catch (error: any) {
      console.error('Admin Ошибка получения пользователя в onInitNewRow:', error.message);
      e.cancel = true;
    }
  }
}