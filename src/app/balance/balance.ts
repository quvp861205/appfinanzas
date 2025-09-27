import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IngresosService, Ingreso } from '../ingresos/ingresos.service';
import { MovimientoService, Movimiento } from '../movimientos/services/movimiento.service';
import { MsiService, MsiRecord } from '../msi/msi.service';
import { FormsModule } from '@angular/forms';

export interface Semana {
  numSemana: number;
  fechaInicio: string;
  fechaFin: string;
  gasto: number;
  gastoLimite: number;
  saldo: number;
  dias: number;
}

@Component({
  selector: 'app-balance',
  imports: [CommonModule, MatButtonModule, MatIconModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './balance.html',
  styleUrls: ['./balance.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Balance {
  private dialogRef = inject(MatDialogRef<Balance>);
  private ingresosService = inject(IngresosService);
  private movimientoService = inject(MovimientoService);
  private msiService = inject(MsiService);

  selectedDate = signal(new Date().toISOString().split('T')[0]);

  private ingresos = this.ingresosService.ingresos;
  private movimientos = this.movimientoService.movimientos;
  private msi = this.msiService.msi;

  ingresoTotalDelMes = computed(() => {
    const [year, month] = this.selectedDate().split('-');
    return this.ingresos()
      .filter((ingreso: Ingreso) => ingreso.fecha.startsWith(`${year}-${month}`))
      .reduce((total: number, ingreso: Ingreso) => total + ingreso.monto, 0);
  });

  gastoVariableDelMes = computed(() => {
    const [year, month] = this.selectedDate().split('-');
    return this.movimientos()
      .filter(mov => mov.fecha.startsWith(`${year}-${month}`))
      .reduce((total, mov) => total + mov.monto, 0);
  });

  gastoFijoDelMes = computed(() => {
    const [year, month] = this.selectedDate().split('-');
    return this.msi()
      .filter((msi: MsiRecord) => msi.fecha.startsWith(`${year}-${month}`))
      .reduce((total: number, msi: MsiRecord) => total + msi.monto, 0);
  });

  gastoTotalDelMes = computed(() => this.gastoVariableDelMes() + this.gastoFijoDelMes());

  saldoFinal = computed(() => this.ingresoTotalDelMes() - this.gastoTotalDelMes());

  semanas = computed(() => this.calcularSemanas(this.selectedDate()));

  esSemanaActual(semana: Semana): boolean {
    const hoy = new Date();
    // Convertir las fechas de string a Date sin ajuste de zona horaria
    const [startYear, startMonth, startDay] = semana.fechaInicio.split('-').map(Number);
    const inicio = new Date(startYear, startMonth - 1, startDay);

    const [endYear, endMonth, endDay] = semana.fechaFin.split('-').map(Number);
    const fin = new Date(endYear, endMonth - 1, endDay);

    // Ajustar la hora de `fin` al final del día para una comparación inclusiva
    fin.setHours(23, 59, 59, 999);

    return hoy >= inicio && hoy <= fin;
  }

  private calcularSemanas(selectedDate: string): Semana[] {
    const [year, month] = selectedDate.split('-').map(Number);
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const weeks: { start: Date; end: Date }[] = [];

    let currentDay = new Date(firstDayOfMonth);

    while (currentDay.getMonth() === month - 1) {
      const weekStart = new Date(currentDay);
      const dayOfWeek = weekStart.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      
      let weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + daysUntilSunday);

      if (weekEnd.getMonth() !== month - 1 || weekEnd.getDate() > lastDayOfMonth.getDate()) {
        weekEnd = new Date(lastDayOfMonth);
      }

      weeks.push({ start: weekStart, end: weekEnd });

      currentDay = new Date(weekEnd);
      currentDay.setDate(currentDay.getDate() + 1);
    }

    if (weeks.length > 1) {
      const lastWeek = weeks[weeks.length - 1];
      const dayDifference = ((lastWeek.end.getTime() - lastWeek.start.getTime()) / (1000 * 3600 * 24)) + 1;
      if (dayDifference < 7) {
        const penultimateWeek = weeks[weeks.length - 2];
        penultimateWeek.end = lastWeek.end;
        weeks.pop();
      }
    }

    const ingresoDisponible = this.ingresoTotalDelMes() - this.gastoFijoDelMes();
    const gastoLimitePorSemana = weeks.length > 0 ? ingresoDisponible / weeks.length : 0;

    return weeks.map((week, index) => {
      const fechaInicio = this.formatDate(week.start);
      const fechaFin = this.formatDate(week.end);
      const dias = ((week.end.getTime() - week.start.getTime()) / (1000 * 3600 * 24)) + 1;

      const gastoSemanal = this.movimientos()
        .filter(mov => {
          const movDate = new Date(mov.fecha + 'T00:00:00');
          return movDate >= week.start && movDate <= week.end;
        })
        .reduce((acc, mov) => acc + mov.monto, 0);

      return {
        numSemana: index + 1,
        fechaInicio,
        fechaFin,
        dias: Math.round(dias),
        gasto: gastoSemanal,
        gastoLimite: gastoLimitePorSemana,
        saldo: gastoLimitePorSemana - gastoSemanal,
      };
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
  }

  close(): void {
    this.dialogRef.close();
  }
}
