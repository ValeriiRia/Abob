import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- ИСПРАВЛЕНИЕ: Требуется для *ngIf
import { DxListModule } from 'devextreme-angular'; // [1, 2]
// Убедитесь, что этот путь соответствует вашему файлу 'supabase.ts' [3]
import { SupabaseService, Project } from '../../../core/services/supabase'; 
import { DxLoadIndicatorModule } from 'devextreme-angular';

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  //
  // ИСПРАВЛЕНИЕ 1 (для ошибки на строке 11: "Expression expected"):
  // 'imports' должен быть корректным массивом JavaScript.
  //
  imports:[ CommonModule, DxListModule, DxLoadIndicatorModule ],
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.scss']
})
export class PortfolioListComponent implements OnInit {
  supabase = inject(SupabaseService);
  
  //
  // ИСПРАВЛЕНИЕ 2 (для ошибки на строке 20: "Expression expected" 
  // и ошибки на строке 30: "Type 'any' is missing..."):
  // 'projects' должен быть МАССИВОМ (Project) 
  // и инициализирован (=).
  //
  projects: Project[] = []; 
  
  loading = true;

  async ngOnInit() {
    const { data, error } = await this.supabase.getProjects(); // [3]
    
    if (data) {
      //
      // Теперь это присваивание корректно, так как 'data' (массив)
      // присваивается 'this.projects' (массив Project).
      //
      this.projects = data; 
    }
    if (error) {
      console.error('Ошибка загрузки проектов:', error);
    }
    this.loading = false;
  }
}