import { ChangeDetectionStrategy, Component, signal, inject, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GastoService, Gasto } from './services/gastos.service';
import { DetalleGastosComponent } from "./detallegastos/detallegastoscomponent";
import { FocoService } from "../utileria/foco.service";


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
    DetalleGastosComponent
  ],
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovimientosComponent implements AfterViewInit {

  private fb = inject(FormBuilder);
  private movimientoService = inject(GastoService);
  private focoService = inject(FocoService);

  montoInput = viewChild<ElementRef<HTMLInputElement>>('montoInput');
  gastoSeleccionado = signal<Gasto | null>(null);


  private getTodayAsString(): string {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(today);
  }

  gastoForm = this.fb.group({
    monto: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    descripcion: ['', [Validators.required, Validators.maxLength(100)]],
    fecha: [this.getTodayAsString(), Validators.required]
  });

  ngAfterViewInit() {
    if( !this.focoService.foco() ) {
      setTimeout(() => this.montoInput()?.nativeElement.focus(), 1500);
      this.focoService.foco.set(true);
    }
    
  }

  onEditarGasto(movimiento: Gasto) {
    this.gastoSeleccionado.set(movimiento);
    this.gastoForm.patchValue(movimiento);
  }

  async guardarMovimiento() {
    if (this.gastoForm.invalid) {
      this.gastoForm.markAllAsTouched();
      return;
    }

    const movimientoData = this.gastoForm.getRawValue();
    const selectedMovimiento = this.gastoSeleccionado();

    try {
      if (selectedMovimiento && selectedMovimiento.id) {
        await this.movimientoService.actualizarGasto(selectedMovimiento.id, movimientoData as Partial<Gasto>);
      } else {
        await this.movimientoService.agregarGasto(movimientoData as Gasto);
      }
      this.resetForm();
    } catch (err) {
      console.error('Error al guardar el gasto:', err);
      alert('Hubo un error al guardar el gasto.');
    }
  }

  async onEliminar() {    
    const selectedMovimiento = this.gastoSeleccionado();

    if (selectedMovimiento && selectedMovimiento.id && confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        await this.movimientoService.eliminarGasto(selectedMovimiento.id);
        this.resetForm();
      } catch (err) {
        console.error('Error al eliminar el gasto:', err);
        alert('Hubo un error al eliminar el gasto.');
      }
    }
  }

  resetForm() {
    this.gastoForm.reset({
      monto: null,
      descripcion: '',
      fecha: this.getTodayAsString()
    });
    this.gastoSeleccionado.set(null);    
  }  
}