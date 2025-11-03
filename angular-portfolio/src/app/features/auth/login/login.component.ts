import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// Нам нужны ReactiveForms для формы входа
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase'; // [1]
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  supabase = inject(SupabaseService);
  router = inject(Router);
  loading = false;
  message: string | null = null;

  // Создаем форму с валидацией
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    try {
      this.loading = true;
      this.message = null;
      const email = this.loginForm.value.email as string;
      const { error } = await this.supabase.signIn(email); // [1]
      if (error) throw error;
      this.message = 'Проверьте почту! Мы отправили вам "магическую" ссылку для входа.';
    } catch (error: any) {
      //
      // --- ВОТ ВТОРОЕ ИСПРАВЛЕНИЕ: ---
      // Используем || (логическое "ИЛИ")
      //
      this.message = error.message || 'Произошла ошибка при входе.';
    } finally {
      this.loading = false;
    }
  }
}