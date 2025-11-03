import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase'; // [1]

export const authGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // ИСПРАВЛЕНИЕ: Используем getUser() вместо getSession()
  const { data } = await supabase.getUser(); //
  
  // ИСПРАВЛЕНИЕ: Проверяем data.user, а не data.session
  if (data.user) {
    return true; // Пользователь вошел, доступ разрешен
  }
  
  // Пользователь не вошел, перенаправляем на /login
  router.navigate(['/login']); //
  return false;
};