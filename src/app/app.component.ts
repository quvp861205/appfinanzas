import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatDialogModule
  ],
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  user = this.authService.uid$;

  async openIngresosDialog(): Promise<void> {
    const { IngresosComponent } = await import('./ingresos/ingresos.component');
    this.dialog.open(IngresosComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog'
    });
  }

  async openMsiDialog(): Promise<void> {
    const { Msi } = await import('./msi/msi');
    this.dialog.open(Msi, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog'
    });
  }

  async openFechaCorteDialog(): Promise<void> {
    const { Fechacorte } = await import('./fechacorte/fechacorte');
    this.dialog.open(Fechacorte, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog'
    });
  }

  async openBalanceDialog(): Promise<void> {
    const { Balance } = await import('./balance/balance');
    this.dialog.open(Balance, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog'
    });
  }
  
  async openBalanceMensualDialog(): Promise<void> {
    const { BalanceMensualComponent } = await import('./balancemensual/balancemensual.component');
    this.dialog.open(BalanceMensualComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog'
    });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
