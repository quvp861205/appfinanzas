import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GastoService as GastosService, Gasto } from '../services/gastos.service';

@Component({
  selector: 'app-detalle-gastos',
  imports: [
    CommonModule,
    DatePipe
  ],
  templateUrl: './detallegastos.html',
  styleUrls: ['./detallegastos.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetalleGastosComponent {
  private gastosService = inject(GastosService);
  private todosLosGastos = this.gastosService.gastos;

  limit = signal(30);
  limitOptions = [30, 50, 100, 200];
  mostrarTodos = signal(false); // Iniciar sin 'Todos' seleccionado

  // Nueva señal computada para filtrar los movimientos
  movimientos = computed(() => {
    const allMoves = this.todosLosGastos();
    if (this.mostrarTodos()) {
      return allMoves; // Si 'Todos' está activo, muestra todos los movimientos (ya limitados por el servicio)
    }
    // Si 'Todos' no está activo, muestra solo los de la semana actual
    return allMoves.filter(movimiento => this.esSemanaActual(movimiento.fecha));
  });

  editarMovimiento = output<Gasto>();
  eliminarMovimiento = output<string>();

  gastoSemanal = computed(() => {
    // El gasto semanal siempre se calcula sobre todos los movimientos para ser preciso
    return this.todosLosGastos()
      .filter(movimiento => this.esSemanaActual(movimiento.fecha))
      .reduce((acc, movimiento) => acc + movimiento.monto, 0);
  });

  onLimitChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLimit = Number(target.value);
    this.limit.set(newLimit);
    this.gastosService.setLimit(newLimit);
  }

  onMostrarTodosChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.mostrarTodos.set(target.checked);
  }

  onEditar(movimiento: Gasto): void {
    this.editarMovimiento.emit(movimiento);
  }

  onEliminar(id: string | undefined): void {
    if (id) {
      this.eliminarMovimiento.emit(id);
    }
  }

  private getStartOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }
  
  private getEndOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  private getWeekLimitsForDate(date: Date): { start: Date; end: Date } {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // --- Calculate First Week's End (the first Sunday) ---
    const endOfFirstWeek = new Date(firstDayOfMonth);
    const dayOfWeekOfFirstDay = firstDayOfMonth.getDay(); // 0=Sun
    if (dayOfWeekOfFirstDay !== 0) { // If not Sunday
        endOfFirstWeek.setDate(1 + (7 - dayOfWeekOfFirstDay));
    }
    // Now endOfFirstWeek is the first Sunday of the month.

    // Check if the given date falls into the first week
    if (day <= endOfFirstWeek.getDate()) {
        return {
            start: this.getStartOfDay(firstDayOfMonth),
            end: this.getEndOfDay(endOfFirstWeek),
        };
    }

    // --- Calculate Last Week's Start (the last Monday) ---
    const startOfLastWeek = new Date(lastDayOfMonth);
    const dayOfWeekOfLastDay = lastDayOfMonth.getDay(); // 0=Sun
    const daysToSubtractForLastWeek = dayOfWeekOfLastDay === 0 ? 6 : dayOfWeekOfLastDay - 1;
    startOfLastWeek.setDate(lastDayOfMonth.getDate() - daysToSubtractForLastWeek);

    // Check if the given date falls into the last week
    if (date >= startOfLastWeek) {
        return {
            start: this.getStartOfDay(startOfLastWeek),
            end: this.getEndOfDay(lastDayOfMonth),
        };
    }
    
    // --- Intermediate Weeks (standard Mon-Sun) ---
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay(); // 0=Sun
    const daysToSubtractForMidWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(day - daysToSubtractForMidWeek);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
        start: this.getStartOfDay(startOfWeek),
        end: this.getEndOfDay(endOfWeek),
    };
  }

  esSemanaActual(fecha: string): boolean {
    const hoy = new Date();
    const fechaMovimiento = new Date(fecha);
    fechaMovimiento.setMinutes(fechaMovimiento.getMinutes() + fechaMovimiento.getTimezoneOffset());

    const limitesSemanaActual = this.getWeekLimitsForDate(hoy);

    return fechaMovimiento >= limitesSemanaActual.start && fechaMovimiento <= limitesSemanaActual.end;
  }
}
