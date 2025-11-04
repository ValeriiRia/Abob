import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
//
// Убедитесь, что 'isPlatformBrowser' импортирован из '@angular/common'
//
import { isPlatformBrowser, CommonModule } from '@angular/common'; 
import { DxListModule } from 'devextreme-angular'; // [1, 2]
import { DxLoadIndicatorModule } from 'devextreme-angular';

// Убедитесь, что путь 'src/app/core/services/supabase' верен [3]
import { SupabaseService, Project } from '../../../core/services/supabase'; 

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports:[CommonModule, DxListModule, DxLoadIndicatorModule], // [1, 2]
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.scss']
})
export class PortfolioListComponent implements OnInit {
  supabase = inject(SupabaseService);
  projects: Project [] = [];
  loading = true; // По умолчанию true

  // Внедряем PLATFORM_ID, чтобы знать, где выполняется код
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log('PortfolioListComponent: КОНСТРУКТОР. Компонент создан.');
  }

  async ngOnInit() {
    console.log('PortfolioListComponent: ngOnInit() СТАРТ');
    
    //
    // Эта проверка КРИТИЧЕСКИ ВАЖНА
    //
    if (isPlatformBrowser(this.platformId)) {
      //
      // === ВЫ УВИДИТЕ ЭТО В КОНСОЛИ БРАУЗЕРА (F12) ===
      //
      console.log('PortfolioListComponent: ПЛАТФОРМА = БРАУЗЕР. Выполняю запрос...');
      this.loading = true;
      const { data, error } = await this.supabase.getProjects(); // [3]
      
      if (data) {
        console.log('PortfolioListComponent: Данные получены:', data);
        this.projects = data;
      }
      if (error) {
        console.error('PortfolioListComponent: Ошибка загрузки проектов:', error);
      }
      this.loading = false;
      
    } else {
      //
      // === ВЫ УВИДИТЕ ЭТО В ТЕРМИНАЛЕ (ГДЕ ЗАПУЩЕН 'ng serve') ===
      //
      console.log('PortfolioListComponent: ПЛАТФОРМА = СЕРВЕР (SSR). Пропускаю запрос.');
      // 'this.supabase' здесь 'undefined', поэтому мы НИЧЕГО не вызываем.
      // Ошибка должна исчезнуть.
    }
  }
}