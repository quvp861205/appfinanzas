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
    // Esto es reactivo. Se ejecutará cuando currentUser() cambie de undefined a un usuario.
    effect(() => {
      if(this.authService.getUID()!='')
      {
        const currentUser = this.authService.getUID();

        if (currentUser) {
          this.authService.setUID(currentUser);
          this.router.navigate(['/gastos']);
        }
      }
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['login']),
      error: (err) => console.error('Error en el logout:', err)
    });
  }

  onLogin() {
    this.authService.loginConGoogle().subscribe({
      next: () => this.router.navigate(['gastos']),
      error: (err) => console.error('Error en el login:', err)
    });
  }
}
