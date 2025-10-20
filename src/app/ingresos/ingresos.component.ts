import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IngresosService, Ingreso } from './ingresos.service';

@Component({
  selector: 'app-ingresos',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, DatePipe],
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngresosComponent {
  private fb = inject(FormBuilder);
  private ingresosService = inject(IngresosService);
  private dialogRef = inject(MatDialogRef<IngresosComponent>);

  private todosLosIngresos = this.ingresosService.ingresos;
  
  // Señales para los filtros
  mostrarTodos = signal(false);
  selectedYear = signal(new Date().getFullYear());

  // Opciones para el selector de año (del actual hasta 2050)
  yearOptions = Array.from({ length: 2051 - new Date().getFullYear() }, (_, i) => new Date().getFullYear() + i);

  ingresos = computed(() => {
    const allIngresos = this.todosLosIngresos();
    const year = this.selectedYear();

    // 1. Filtrar por el año seleccionado
    const ingresosDelAnio = allIngresos.filter(ingreso => {
      // Ajuste para fechas de Firebase que pueden no ser objetos Date
      const ingresoYear = new Date(ingreso.fecha).getFullYear();
      return ingresoYear === year;
    });

    // 2. Si "Todos" no está activo, filtrar por el mes actual
    if (!this.mostrarTodos()) {
      const hoy = new Date();
      const currentMonth = hoy.getMonth(); // 0-11

      return ingresosDelAnio.filter(ingreso => {
        const ingresoMonth = new Date(ingreso.fecha).getMonth();
        return ingresoMonth === currentMonth;
      });
    }

    // 3. Si "Todos" está activo, devolver todos los del año
    return ingresosDelAnio;
  });

  ingresoForm = this.fb.group({
    monto: ['', [Validators.required, Validators.min(0.01)]],
    descripcion: ['', Validators.required],
    fecha: [new Date().toISOString().substring(0, 10), Validators.required]
  });

  onMostrarTodosChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.mostrarTodos.set(target.checked);
  }

  onYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedYear.set(Number(target.value));
  }

  esMesActual(fecha: string): boolean {
    const hoy = new Date();
    const currentYear = hoy.getFullYear();
    const currentMonth = hoy.getMonth() + 1;

    const [ingresoYear, ingresoMonth] = fecha.split('-').map(Number);

    return currentYear === ingresoYear && currentMonth === ingresoMonth;
  }

  close(): void {
    this.dialogRef.close();
  }

  async guardarIngreso() {
    if (this.ingresoForm.invalid) {
      return;
    }

    const formValue = this.ingresoForm.getRawValue();
    const nuevoIngreso: Omit<Ingreso, 'id'> = {
      monto: Number(formValue.monto),
      descripcion: formValue.descripcion!,
      fecha: formValue.fecha!,
    };

    try {
      await this.ingresosService.addIngreso(nuevoIngreso);
      alert('Se ha guardado con exito.');
      this.ingresoForm.reset({
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().substring(0, 10)
      });
      
    } catch (error) {
      console.error('Error al guardar el ingreso:', error);
      alert('Hubo un error al guardar el ingreso.');
    }
  }

  async eliminarIngreso(id: string | undefined) {
    if (!id) return;

    if (confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
      try {
        await this.ingresosService.deleteIngreso(id);
        alert('Se ha eliminado con exito.');
      } catch (error) {
        console.error('Error al eliminar el ingreso:', error);
        alert('Hubo un error al eliminar el ingreso.');
      }
    }
  }
}
