import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MovimientoService, Movimiento } from '../services/movimiento.service';

@Component({
  selector: 'app-detalle-movimientos',
  imports: [
    CommonModule,
    DatePipe
  ],
  templateUrl: './detallemovimientos.html',
  styleUrls: ['./detallemovimientos.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetalleMovimientosComponent {
  private movimientoService = inject(MovimientoService);
  movimientos = this.movimientoService.movimientos;
  
  editarMovimiento = output<Movimiento>();
  eliminarMovimiento = output<string>(); // Nuevo output para el ID

  onEditar(movimiento: Movimiento): void {
    this.editarMovimiento.emit(movimiento);
  }

  onEliminar(id: string | undefined): void {
    if (id) {
      this.eliminarMovimiento.emit(id);
    }
  }

  esSemanaActual(fecha: string): boolean {
    const hoy = new Date();
    const fechaMovimiento = new Date(fecha);
    // Ajustar la fecha a la zona horaria local
    fechaMovimiento.setMinutes(fechaMovimiento.getMinutes() + fechaMovimiento.getTimezoneOffset());

    const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1)));
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return fechaMovimiento >= inicioSemana && fechaMovimiento <= finSemana;
  }
}
