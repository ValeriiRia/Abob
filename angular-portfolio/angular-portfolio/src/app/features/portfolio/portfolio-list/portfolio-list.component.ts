import { 
  Component, 
  OnInit, 
  inject, 
  Inject, 
  PLATFORM_ID, 
  ChangeDetectorRef // <-- 1. ИМПОРТИРУЙТЕ ChangeDetectorRef
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; 
import { DxListModule } from 'devextreme-angular'; 
import { DxLoadIndicatorModule } from 'devextreme-angular';
import { SupabaseService, Project } from '../../../core/services/supabase'; 
import { filter, first } from 'rxjs/operators'; 

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports:[CommonModule, DxListModule, DxLoadIndicatorModule], 
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.scss']
})
export class PortfolioListComponent implements OnInit {
  supabase = inject(SupabaseService);
  projects: Project [] = [];
  loading = true; // По умолчанию true
  public isBrowser: boolean; 
  
  // 2. ВНЕДРИТЕ ChangeDetectorRef
  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId); 
    console.log('PortfolioListComponent: КОНСТРУКТОР. Компонент создан.');
  }

  ngOnInit(): void {
    console.log('PortfolioListComponent: ngOnInit() СТАРТ');
    
    if (isPlatformBrowser(this.platformId)) {
      console.log('PortfolioListComponent: ПЛАТФОРМА = БРАУЗЕР. Ожидаю authLoading$...');
      
      this.supabase.authLoading$.pipe(
        filter(isLoading => isLoading === false), 
        first()                                 
      ).subscribe(() => {
        console.log('PortfolioListComponent: authLoading$ = false. Выполняю loadData()...');
        this.loadData(); 
      });
      
    } else {
      console.log('PortfolioListComponent: ПЛАТФОРМА = СЕРВЕР (SSR). Пропускаю запрос.');
      this.loading = false; // На сервере сразу выключаем загрузку
    }
  }

  async loadData() {
    try {
      this.loading = true; 
      // 3. Сообщаем Angular, что 'loading' стал 'true'
      this.cdr.markForCheck(); 

      const { data, error } = await this.supabase.getProjects(); 
      
      if (data) {
        console.log('PortfolioListComponent: Данные получены:', data);
        this.projects = data;
      }
      if (error) {
        console.error('PortfolioListComponent: Ошибка загрузки проектов:', error);
      }
    } catch (e) {
      console.error('PortfolioListComponent: КРИТИЧЕСКАЯ Ошибка загрузки проектов:', e);
    } finally {
      this.loading = false; 
      console.log('PortfolioListComponent: Загрузка завершена, loading=false');
      
      // 4. ГЛАВНОЕ ИСПРАВЛЕНИЕ:
      // Сообщаем Angular, что 'loading' стал 'false' и 'projects' обновился
      this.cdr.markForCheck(); 
    }
  }
}