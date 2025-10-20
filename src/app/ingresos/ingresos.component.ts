import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IngresosService, Ingreso } from './ingresos.service';
import { NotificationService } from '../utileria/notification.service';
import { ConfirmationDialogService } from '../utileria/confirmation-dialog/confirmation-dialog.service';
import { filter } from 'rxjs/operators';

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
  private notificationService = inject(NotificationService);
  private confirmationDialogService = inject(ConfirmationDialogService);

  private todosLosIngresos = this.ingresosService.ingresos;
  
  mostrarTodos = signal(false);
  selectedYear = signal(new Date().getFullYear());

  yearOptions = Array.from({ length: 2051 - new Date().getFullYear() }, (_, i) => new Date().getFullYear() + i);

  ingresos = computed(() => {
    const allIngresos = this.todosLosIngresos();
    const year = this.selectedYear();

    const ingresosDelAnio = allIngresos.filter(ingreso => {
      const ingresoYear = new Date(ingreso.fecha).getFullYear();
      return ingresoYear === year;
    });

    if (!this.mostrarTodos()) {
      const hoy = new Date();
      const currentMonth = hoy.getMonth();

      return ingresosDelAnio.filter(ingreso => {
        const ingresoMonth = new Date(ingreso.fecha).getMonth();
        return ingresoMonth === currentMonth;
      });
    }

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
      this.ingresoForm.markAllAsTouched();
      return;
    }

    const formValue = this.ingresoForm.getRawValue();

    // Formatear la descripción como se solicitó
    const date = new Date(formValue.fecha! + 'T00:00:00');
    const monthAbbreviations = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = monthAbbreviations[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    const newDescription = `${formValue.descripcion!} ${month}${year}`;

    const nuevoIngreso: Omit<Ingreso, 'id'> = {
      monto: Number(formValue.monto),
      descripcion: newDescription, // Usamos la nueva descripción
      fecha: formValue.fecha!,
    };

    try {
      await this.ingresosService.addIngreso(nuevoIngreso);
      this.notificationService.show('Se ha guardado con éxito.');
      this.ingresoForm.reset({
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().substring(0, 10)
      });
    } catch (error) {
      console.error('Error al guardar el ingreso:', error);
      this.notificationService.show('Hubo un error al guardar el ingreso.', true);
    }
  }

  eliminarIngreso(id: string | undefined) {
    if (!id) return;

    this.confirmationDialogService.open('¿Estás seguro de que deseas eliminar este ingreso?')
      .pipe(filter(confirmed => confirmed))
      .subscribe(async () => {
        try {
          await this.ingresosService.deleteIngreso(id!);
          this.notificationService.show('Se ha eliminado con éxito.');
        } catch (error) {
          console.error('Error al eliminar el ingreso:', error);
          this.notificationService.show('Hubo un error al eliminar el ingreso.', true);
        }
      });
  }
}
