import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  createClient, 
  SupabaseClient, 
  AuthChangeEvent,
  Session,
  User
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment'; 
import { BehaviorSubject, Observable } from 'rxjs'; 

// Интерфейс Project (оставьте как есть)
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
  public supabase!: SupabaseClient; // '!'

  // Реактивное хранилище для текущего пользователя
  private _sessionUser = new BehaviorSubject<User | null>(null);
  public sessionUser$: Observable<User | null> = this._sessionUser.asObservable();

  // Реактивное хранилище для статуса загрузки аутентификации (для authGuard)
  private _authLoading = new BehaviorSubject<boolean>(true);
  public authLoading$: Observable<boolean> = this._authLoading.asObservable();

  //
  // --- ВОТ ИСПРАВЛЕНИЕ, КОТОРОЕ ВЫ ПРОПУСТИЛИ ---
  // Добавляем публичный геттер для синхронного получения значения
  //
  public get currentUser(): User | null {
    return this._sessionUser.getValue();
  }
  // --- КОНЕЦ ИСПРАВЛЕНИЯ ---


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseKey
      ); // [1]

      //
      // --- ИСПРАВЛЕНИЕ ЛОГИКИ ---
      //
      // 1. СЛУШАТЕЛЬ (onAuthStateChange) теперь ТОЛЬКО обновляет пользователя.
      // Он НЕ трогает флаг _authLoading.
      //
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('SupabaseService: onAuthStateChange event:', event);
        this._sessionUser.next(session?.user?? null);
      });

      //
      // 2. ПЕРВИЧНАЯ ПРОВЕРКА (getUser) - ЕДИНСТВЕННАЯ вещь,
      // которая устанавливает _authLoading в 'false'.
      //
      console.log('SupabaseService: Вызываю getUser() для первоначальной проверки...');
      this.supabase.auth.getUser().then(({ data, error }) => { // [1]
        if (error) {
          console.error('SupabaseService: Ошибка при initial getUser()', error);
        }
        console.log('SupabaseService: Initial getUser() завершен. User:', data.user?.email?? null);
        this._sessionUser.next(data.user?? null);
        this._authLoading.next(false); // <--- МЫ ОФИЦИАЛЬНО "ЗАГРУЖЕНЫ"
      });
      
    } else {
      // На сервере (SSR)
      console.log('SupabaseService: ПЛАТФОРМА = СЕРВЕР (SSR). Клиент не инициализирован.');
      this._authLoading.next(false); // На сервере нечего ждать.
    }
  }

  // --- CRUD-методы (остаются без изменений) ---

  getProjects() {
    return this.supabase
    .from('projects')
    .select('*') // [2]
    .order('created_at', { ascending: false });
  }

  createProject(projectData: Partial<Project>) {
    //
    // --- ВОТ ИСПРАВЛЕНИЕ ---
    // Мы убрали .select()
    //
    return this.supabase
    .from('projects')
    .insert(projectData); // [3]
  }

  updateProject(id: string, projectData: Partial<Project>) {
    return this.supabase
    .from('projects')
    .update(projectData) // [4]
    .eq('id', id)
    .select(); // [4]
  }

  deleteProject(id: string) {
    return this.supabase
    .from('projects')
    .delete() // [5]
    .eq('id', id);
  }

  // --- Методы аутентификации (остаются без изменений) ---

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email }); // [1]
  }

  signOut() {
    return this.supabase.auth.signOut(); // [1]
  }

  getUser() {
    return this.supabase.auth.getUser(); // [1]
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback); // [1]
  }
}