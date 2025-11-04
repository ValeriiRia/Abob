import { inject, PLATFORM_ID } from '@angular/core'; // <-- Импортируем PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // <-- Импортируем isPlatformBrowser
import { CanActivateFn, Router, UrlTree } from '@angular/router'; 
import { SupabaseService } from '../services/supabase'; //
import { Observable, of } from 'rxjs'; // <-- Импортируем 'of'
// Убедитесь, что импортированы 'map', 'filter', 'switchMap', 'tap' и 'first'
import { map, filter, switchMap, tap, first } from 'rxjs/operators'; 

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const supabase = inject(SupabaseService); //
  const router = inject(Router); //
  const platformId = inject(PLATFORM_ID); // <-- Внедряем ID платформы

  console.log('AuthGuard: СТАРТ. Начинаю проверку...');

  //
  // --- ВОТ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ---
  //
  if (!isPlatformBrowser(platformId)) {
    //
    // --- МЫ НА СЕРВЕРЕ (SSR) ---
    //
    console.log('AuthGuard: ПЛАТФОРМА = СЕРВЕР. Разрешаю рендеринг (SSR). Клиент разберется.');
    //
    // Мы ДОЛЖНЫ вернуть 'true', чтобы сервер отрендерил
    // оболочку компонента. Клиентский 'authGuard'
    // затем запустится при гидратации и выполнит реальную проверку.
    //
    return of(true); // <-- ИЗМЕНЕНО
  }

  //
  // --- МЫ В БРАУЗЕРЕ ---
  // (Этот код будет выполнен только на клиенте)
  //
  console.log('AuthGuard: ПЛАТФОРМА = БРАУЗЕР. Запускаю реактивную проверку...');
  
  return supabase.authLoading$.pipe(
    tap(isLoading => console.log('AuthGuard (Браузер): authLoading$ =', isLoading)),
    // 1. Ждем, пока authLoading$ не станет 'false'
    filter(isLoading =>!isLoading), //
    tap(() => console.log('AuthGuard (Браузер): authLoading$ стал false. Переключаюсь на sessionUser$...')),
    
    // 2. Как только он стал 'false', переключаемся на sessionUser$
    switchMap(() => supabase.sessionUser$), //
    
    // 3. Теперь принимаем решение, зная, что сессия актуальна
    tap(user => console.log('AuthGuard (Браузер): sessionUser$ =', user? user.email : null)),
    map(user => {
      if (user) {
        console.log('AuthGuard (Браузер): РЕШЕНИЕ = true (пользователь есть, пропускаю).');
        return true; //
      } else {
        console.log('AuthGuard (Браузер): РЕШЕНИЕ = false (пользователя нет, перенаправляю на /login).');
        return router.createUrlTree(['/login']); //
      }
    }),
    first() // <-- Важно: отписываемся после первого же решения
  );
};