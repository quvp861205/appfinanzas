import { afterNextRender, ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { AuthService } from './auth/services/auth.service';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    MatDialogModule
  ],
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);

  user = this.authService.currentUser;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        SplashScreen.hide();
      }
    });
  }

  async openIngresosDialog(): Promise<void> {
    const { IngresosComponent } = await import('./ingresos/ingresos.component');
    this.dialog.open(IngresosComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms'
    });
  }

  async openMsiDialog(): Promise<void> {
    const { Msi } = await import('./msi/msi');
    this.dialog.open(Msi, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms'
    });
  }

  async openFechaCorteDialog(): Promise<void> {
    const { Fechacorte } = await import('./fechacorte/fechacorte');
    this.dialog.open(Fechacorte, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms'
    });
  }

  async openBalanceDialog(): Promise<void> {
    const { Balance } = await import('./balance/balance');
    this.dialog.open(Balance, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms'
    });
  }
  
  async openBalanceMensualDialog(): Promise<void> {
    const { BalanceMensualComponent } = await import('./balancemensual/balancemensual.component');
    this.dialog.open(BalanceMensualComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms'
    });
  }

  async openMsiresumenDialog(): Promise<void> {
    const { Msiresumen } = await import('./msiresumen/msiresumen');
    this.dialog.open(Msiresumen, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms'
    });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
