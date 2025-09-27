import { ChangeDetectionStrategy, Component, signal, inject, AfterViewInit, ElementRef, viewChild, computed } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MovimientoService, Movimiento } from './services/movimiento.service';
import { DetalleMovimientosComponent } from "./detallemovimientos/detallemovimientos.component";
import { FocoService } from "../utileria/foco.service";
import { IngresosService, Ingreso } from '../ingresos/ingresos.service';
import { MsiService, MsiRecord } from '../msi/msi.service';

// Defining the interface locally as it's not provided by a central service.
export interface Semana {
  numSemana: number;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  gasto: number;
  gastoLimite: number;
  saldo: number;
}

@Component({
  selector: 'app-movimientos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DetalleMovimientosComponent,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientosComponent implements AfterViewInit {

  private fb = inject(FormBuilder);
  private movimientoService = inject(MovimientoService);
  private focoService = inject(FocoService);
  private ingresosService = inject(IngresosService);
  private msiService = inject(MsiService);

  montoInput = viewChild<ElementRef<HTMLInputElement>>('montoInput');
  movimientoSeleccionado = signal<Movimiento | null>(null);
  
  private movimientos = this.movimientoService.movimientos;
  private ingresos = this.ingresosService.ingresos;
  private msi = this.msiService.msi;

  private currentDate = signal(new Date());

  private ingresoTotalDelMes = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = (this.currentDate().getMonth() + 1).toString().padStart(2, '0');
    const monthString = `${year}-${month}`;

    return this.ingresos()
      .filter((ingreso: Ingreso) => ingreso.fecha.startsWith(monthString))
      .reduce((total: number, ingreso: Ingreso) => total + ingreso.monto, 0);
  });

  private gastoFijoDelMes = computed(() => {
    const year = this.currentDate().getFullYear();
    const month = (this.currentDate().getMonth() + 1).toString().padStart(2, '0');
    const monthString = `${year}-${month}`;

    return this.msi()
      .filter((record: MsiRecord) => record.fecha.startsWith(monthString))
      .reduce((total: number, record: MsiRecord) => total + record.monto, 0);
  });

  infoSemanaActual = computed(() => {
    const hoy = this.currentDate();
    const semanas = this.calcularSemanas(hoy.toISOString().slice(0, 7));
    const semanaActual = semanas.find(s => this.esSemanaActual(s));

    if (!semanaActual) {
        return null;
    };

    const gastosSemana = this.movimientos().filter(m => {
      const fechaMovimiento = new Date(m.fecha + 'T00:00:00'); // Neutralize timezone
      const [startYear, startMonth, startDay] = semanaActual.fechaInicio.split('-').map(Number);
      const inicio = new Date(startYear, startMonth - 1, startDay);
      const [endYear, endMonth, endDay] = semanaActual.fechaFin.split('-').map(Number);
      const fin = new Date(endYear, endMonth - 1, endDay);
      fin.setHours(23, 59, 59, 999);
      
      return fechaMovimiento >= inicio && fechaMovimiento <= fin;
    });

    const gastoTotalSemana = gastosSemana.reduce((acc, curr) => acc + curr.monto, 0);
    
    const ingresoDisponible = this.ingresoTotalDelMes() - this.gastoFijoDelMes();
    const gastoLimiteSemanal = semanas.length > 0 ? ingresoDisponible / semanas.length : 0;

    return {
        semana: semanaActual,
        gastoTotal: gastoTotalSemana,
        limite: gastoLimiteSemanal
    }
  });

  private getTodayAsString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  movimientoForm = this.fb.group({
    monto: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    descripcion: ['', [Validators.required, Validators.maxLength(100)]],
    fecha: [this.getTodayAsString(), Validators.required]
  });

  ngAfterViewInit() {
    if( !this.focoService.foco() ) {
      setTimeout(() => this.montoInput()?.nativeElement.focus(), 200);
      this.focoService.foco.set(true);
    }
    
  }

  onEditarMovimiento(movimiento: Movimiento) {
    this.movimientoSeleccionado.set(movimiento);
    this.movimientoForm.patchValue(movimiento);
  }

  async guardarMovimiento() {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      return;
    }

    const movimientoData = this.movimientoForm.getRawValue();
    const selectedMovimiento = this.movimientoSeleccionado();

    try {
      if (selectedMovimiento && selectedMovimiento.id) {
        await this.movimientoService.actualizarMovimiento(selectedMovimiento.id, movimientoData as Partial<Movimiento>);
      } else {
        await this.movimientoService.agregarMovimiento(movimientoData as Movimiento);
      }
      this.resetForm();
    } catch (err) {
      console.error('Error al guardar el gasto:', err);
      alert('Hubo un error al guardar el gasto.');
    }
  }

  async onEliminar() {    
    const selectedMovimiento = this.movimientoSeleccionado();

    if (selectedMovimiento && selectedMovimiento.id && confirm('¿Estás seguro de que deseas eliminar este gasto?'
    )) {
      try {
        await this.movimientoService.eliminarMovimiento(selectedMovimiento.id);
        this.resetForm();
      } catch (err) {
        console.error('Error al eliminar el gasto:', err);
        alert('Hubo un error al eliminar el gasto.');
      }
    }
  }

  resetForm() {
    this.movimientoForm.reset({
      monto: null,
      descripcion: '',
      fecha: this.getTodayAsString()
    });
    this.movimientoSeleccionado.set(null);    
  }

  private esSemanaActual(semana: Semana): boolean {
    const hoy = this.currentDate();
    const [startYear, startMonth, startDay] = semana.fechaInicio.split('-').map(Number);
    const inicio = new Date(startYear, startMonth - 1, startDay);

    const [endYear, endMonth, endDay] = semana.fechaFin.split('-').map(Number);
    const fin = new Date(endYear, endMonth - 1, endDay);
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
        const startOfWeek = new Date(currentDay);
        let endOfWeek = new Date(startOfWeek);

        if (startOfWeek.getDate() === 1) {
            // First week ends on the first Sunday
            endOfWeek.setDate(startOfWeek.getDate() + (7 - startOfWeek.getDay()) % 7);
             if (endOfWeek.getDay() === 0 && startOfWeek.getDay() !== 0) {
              // Edge case for months starting on a Sunday
            } else if (startOfWeek.getDay() !== 1) {
               endOfWeek.setDate(startOfWeek.getDate() + (7 - startOfWeek.getDay()) % 7);
            } else {
              endOfWeek.setDate(startOfWeek.getDate() + 6);
            }
        } else {
            // Subsequent weeks start on Monday and end on Sunday
            endOfWeek.setDate(startOfWeek.getDate() + 6);
        }
        
        if (endOfWeek.getMonth() !== month - 1 || endOfWeek.getDate() > lastDayOfMonth.getDate()) {
            endOfWeek = new Date(lastDayOfMonth);
        }

        weeks.push({ start: new Date(startOfWeek), end: new Date(endOfWeek) });
        currentDay.setDate(endOfWeek.getDate() + 1);
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

    return weeks.map((week, index) => {
      const fechaInicio = week.start.toISOString().split('T')[0];
      const fechaFin = week.end.toISOString().split('T')[0];
      const dias = (week.end.getTime() - week.start.getTime()) / (1000 * 3600 * 24) + 1;

      return {
          numSemana: index + 1,
          fechaInicio,
          fechaFin,
          dias,
          gasto: 0,
          gastoLimite: 0,
          saldo: 0
      };
    });
  }
}
