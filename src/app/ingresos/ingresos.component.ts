import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

  ingresos = this.ingresosService.ingresos;

  ingresoForm = this.fb.group({
    monto: ['', [Validators.required, Validators.min(0.01)]],
    descripcion: ['', Validators.required],
    fecha: [new Date().toISOString().substring(0, 10), Validators.required]
  });

  /**
   * Compara si la fecha de un ingreso corresponde al mes y año actual.
   * Esta función compara directamente los números del año y mes para evitar
   * problemas relacionados con la zona horaria (timezone).
   */
  esMesActual(fecha: string): boolean {
    const hoy = new Date();
    const currentYear = hoy.getFullYear();
    const currentMonth = hoy.getMonth() + 1; // getMonth() es base 0 (0-11)

    // La fecha del ingreso viene en formato 'YYYY-MM-DD'
    const [ingresoYear, ingresoMonth] = fecha.split('-').map(Number);

    // Se retorna la comparación directa de los valores numéricos.
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
      this.ingresoForm.reset({
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().substring(0, 10)
      });
    } catch (error) {
      console.error('Error al guardar el ingreso:', error);
    }
  }

  async eliminarIngreso(id: string | undefined) {
    if (!id) return;

    if (confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
      try {
        await this.ingresosService.deleteIngreso(id);
      } catch (error) {
        console.error('Error al eliminar el ingreso:', error);
      }
    }
  }
}
