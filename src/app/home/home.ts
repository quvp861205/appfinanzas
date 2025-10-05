
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      // user === undefined -> El estado de autenticación aún se está cargando
      // user === null -> El usuario no ha iniciado sesión
      // user -> El usuario ha iniciado sesión
      if (user) {
        this.router.navigate(['/gastos']);
      } else if (user === null) {
        this.router.navigate(['/login']);
      }
    });
  }
}
