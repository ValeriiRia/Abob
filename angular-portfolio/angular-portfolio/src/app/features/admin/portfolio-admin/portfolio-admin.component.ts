import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; 
import { DxDataGridModule, DxTextAreaModule } from 'devextreme-angular'; 
import CustomStore from 'devextreme/data/custom_store';
import { SupabaseService } from '../../../core/services/supabase'; 

@Component({
  selector: 'app-portfolio-admin',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxTextAreaModule],
  templateUrl: './portfolio-admin.component.html',
  styleUrls: ['./portfolio-admin.component.scss'] 
})
export class PortfolioAdminComponent implements OnInit { 
  supabase = inject(SupabaseService);
  dataSource: CustomStore;
  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('PortfolioAdminComponent: КОНСТРУКТОР. Компонент создан.');
    
    this.dataSource = new CustomStore({ 
      key: 'id', 

      load: async (loadOptions: any) => { 
        if (isPlatformBrowser(this.platformId)) {
          console.log('PortfolioAdminComponent: CustomStore load() вызван.');
          const { data, error } = await this.supabase.getProjects(); 
          if (error) {
            console.error('Admin Ошибка загрузки:', error);
            throw new Error('Ошибка загрузки данных');
          }
          console.log('PortfolioAdminComponent: CustomStore данные получены:', data);
          
          return {
            data: data || [],
            totalCount: data ? data.length : 0
          };
        }
        
        console.log('PortfolioAdminComponent: CustomStore load() вызван на СЕРВЕРЕ (SSR). Пропускаю.');
        return { data: [], totalCount: 0 }; 
      },

      insert: async (values: any) => { 
        console.log('PortfolioAdminComponent: CustomStore insert() вызван. Отправка данных:', values);
        
        const { error } = await this.supabase.createProject(values); 
        
        if (error) { 
          console.error('Admin Ошибка создания:', error);
          throw new Error(error.message || 'Ошибка создания записи'); 
        }
        
        return values;
      },

      update: async (key: any, values: any) => { 
        console.log('PortfolioAdminComponent: CustomStore update() вызван.', key, values);
        
        const { data, error } = await this.supabase.updateProject(key, values); 
        
        if (error || !data) { 
          console.error('Admin Ошибка обновления:', error);
          throw new Error('Ошибка обновления записи');
        }
        return data;
      },

      remove: async (key: any) => { 
        console.log('PortfolioAdminComponent: CustomStore remove() вызван.', key);
        const { error } = await this.supabase.deleteProject(key); 
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

  async onInitNewRow(e: any) {
    console.log('PortfolioAdminComponent: onInitNewRow() вызван.');
    try {
      //
      // --- ИСПОЛЬЗОВАНИЕ НОВОГО ГЕТТЕРА ---
      // (Этот код правильный)
      //
      const user = this.supabase.currentUser; 
      
      if (user) {
        console.log('onInitNewRow: User ID найден:', user.id);
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