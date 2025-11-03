import { Injectable } from '@angular/core';
import { 
  createClient, 
  SupabaseClient, 
  AuthChangeEvent, 
  Session 
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

// Определим тип для нашего проекта
export interface Project {
  id?: string;
  created_at?: string;
  title: string;
  description: string;
  project_link: string;
  image_url: string;
  user_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Сделаем клиент 'public', чтобы его можно было использовать
  // напрямую (например, для auth), но для CRUD будем использовать методы.
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    ); // 
  }
  getProjects() {
    //.select('*') - [45, 53]
    return this.supabase
     .from('projects')
     .select('*')
     .order('created_at', { ascending: false });
  }

  /**
   * Создание (Insert)
   * Создает новый проект.
   */
  createProject(projectData: Partial<Project>) {
    //.insert(projectData) - [44, 54]
    //.select() -  - Важно, чтобы Supabase вернул 
    // созданную запись, так как dxDataGrid ожидает ее.
    return this.supabase
     .from('projects')
     .insert(projectData)
     .select();
  }

  /**
   * Обновление (Update)
   * Обновляет существующий проект по 'id'.
   */
  updateProject(id: string, projectData: Partial<Project>) {
    //.update(projectData) - 
    //.eq('id', id) - [46]
    //.select() - [46] - Также возвращаем обновленную запись.
    return this.supabase
     .from('projects')
     .update(projectData)
     .eq('id', id)
     .select();
  }

  /**
   * Удаление (Delete)
   * Удаляет проект по 'id'.
   */
  deleteProject(id: string) {
    //.delete() - [47]
    //.eq('id', id) - [47]
    return this.supabase
     .from('projects')
     .delete()
     .eq('id', id);
  }
  
  /**
   * Вход по "магической" ссылке (OTP)
   */
  signIn(email: string) {
    // 
    return this.supabase.auth.signInWithOtp({ email });
  }

  /**
   * Выход
   */
  signOut() {
    // 
    return this.supabase.auth.signOut();
  }

  /**
   * Получение текущей сессии
   */
  getUser() {
    return this.supabase.auth.getUser(); //
  }

  /**
   * Прослушивание изменений состояния аутентификации
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    // 
    return this.supabase.auth.onAuthStateChange(callback);
  }
}