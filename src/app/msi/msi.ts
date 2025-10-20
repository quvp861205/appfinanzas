import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MsiService, MsiRecord } from './msi.service';
import { NotificationService } from '../utileria/notification.service';
import { ConfirmationDialogService } from '../utileria/confirmation-dialog/confirmation-dialog.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-msi',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule],
  templateUrl: './msi.html',
  styleUrls: ['./msi.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Msi {
  private fb = inject(FormBuilder);
  private msiService = inject(MsiService);
  private dialogRef = inject(MatDialogRef<Msi>);
  private notificationService = inject(NotificationService);
  private confirmationDialogService = inject(ConfirmationDialogService);

  private allMsiRecords = this.msiService.msi;
  
  selectedDescription = signal<string>('');
  selectedDate = signal<string>('');
  verAntiguos = signal(false);

  uniqueDescriptions = computed(() => {
    const records = this.allMsiRecords();
    const showOld = this.verAntiguos();

    const maxDatesByDescription = new Map<string, string>();
    for (const record of records) {
        const existingMaxDate = maxDatesByDescription.get(record.descripcion);
        if (!existingMaxDate || record.fecha > existingMaxDate) {
            maxDatesByDescription.set(record.descripcion, record.fecha);
        }
    }

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const firstDayOfMonth = new Date(y, m, 1);
    
    const year = firstDayOfMonth.getFullYear();
    const month = (firstDayOfMonth.getMonth() + 1).toString().padStart(2, '0');
    const day = firstDayOfMonth.getDate().toString().padStart(2, '0');
    const firstDayOfMonthString = `${year}-${month}-${day}`;

    const filteredDescriptions: string[] = [];
    for (const [description, maxDate] of maxDatesByDescription.entries()) {
        if (showOld) {
            if (maxDate < firstDayOfMonthString) {
                filteredDescriptions.push(description);
            }
        } else {
            if (maxDate >= firstDayOfMonthString) {
                filteredDescriptions.push(description);
            }
        }
    }

    return filteredDescriptions;
  });

  filteredRecords = computed(() => {
    const records = this.allMsiRecords();
    const desc = this.selectedDescription();
    const date = this.selectedDate();

    if (date) {
      const dateRecords = records.filter(r => r.fecha === date);
      if (desc && desc !== 'all') {
        return dateRecords.filter(r => r.descripcion === desc);
      }
      return dateRecords; 
    }

    if (desc) {
      if (desc === 'all') {
        const visibleDescriptions = this.uniqueDescriptions();
        return records.filter(r => visibleDescriptions.includes(r.descripcion));
      }
      return records.filter(r => r.descripcion === desc);
    }

    return [];
  });

  totalPagoMensual = computed(() => {
    const date = this.selectedDate();
    const records = this.filteredRecords();

    if (date && records.length > 0) {
      return records.reduce((sum: number, record: MsiRecord) => sum + record.monto, 0);
    }

    return null;
  });

  msiForm = this.fb.group({
    monto: [null as number | null, [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    fecha: ['', Validators.required],
    meses: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  close(): void {
    this.dialogRef.close();
  }

  async onSubmit(): Promise<void> {
    if (this.msiForm.invalid) {
      this.msiForm.markAllAsTouched();
      return;
    }

    const formValue = this.msiForm.getRawValue();

    // Formatear la descripción como se solicitó
    const date = new Date(formValue.fecha! + 'T00:00:00');
    const monthAbbreviations = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = monthAbbreviations[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    const newDescription = `${formValue.descripcion!} ${month}${year} ${formValue.meses!}m`;

    try {
      await this.msiService.createMsiRecords({
        monto: formValue.monto!,
        descripcion: newDescription, // Usamos la nueva descripción
        fecha: formValue.fecha!,
        meses: formValue.meses!
      });
      this.notificationService.show('Se ha guardado con éxito.');
      this.msiForm.reset();
      this.selectedDescription.set('');
      this.selectedDate.set('');
    } catch (error) {
      console.log("Error al guardar gasto fijo", error);
      this.notificationService.show('Hubo un error al guardar el gasto fijo.', true);
    }
  }

  onDescriptionFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedDescription.set(selectElement.value);
  }

  onDateFilterChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedDate.set(inputElement.value);
  }

  onDelete(description: string): void {
    const message = `¿Estás seguro de que quieres eliminar todos los registros para "${description}"?`;
    this.confirmationDialogService.open(message)
      .pipe(filter(confirmed => confirmed))
      .subscribe(async () => {
        try {
          await this.msiService.deleteMsiByDescription(description);
          this.notificationService.show('Se han eliminado con éxito.');
        } catch (error) {
          console.log("Error eliminar gastos fijos", error);
          this.notificationService.show('Hubo un error al eliminar los gastos fijos.', true);
        }
      });
  }
  
  trackByRecordId(index: number, record: MsiRecord): string | undefined {
    return record.id;
  }

  onVerAntiguosChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.verAntiguos.set(checkbox.checked);
    this.selectedDescription.set('');
  }
}
