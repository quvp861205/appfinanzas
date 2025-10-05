import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
 
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) {
        this.router.navigate(['/gastos']);
      }
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => console.error('Error en el logout:', err)
    });
  }

  onLogin() {
    this.authService.loginConGoogle().subscribe({
      next: () => {
        // La redirección ahora es manejada por el HomeComponent.
        // Una vez que el login es exitoso y el estado de auth cambia,
        // el 'effect' en HomeComponent se activará.
      },
      error: (err) => console.error('Error en el login:', err)
    });
  }
}
