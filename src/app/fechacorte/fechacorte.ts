
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FechacorteService } from './services/fechacorte.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-fechacorte',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule],
  templateUrl: './fechacorte.html',
  styleUrls: ['./fechacorte.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Fechacorte {
  private fb = inject(FormBuilder);
  private fechacorteService = inject(FechacorteService);
  private dialogRef = inject(MatDialogRef<Fechacorte>);

  fechaCorteForm = this.fb.group({
    fechaCorte: ['', Validators.required]
  });

  diaCorteActual = signal<string | null>(null);

  constructor() {
    this.fechacorteService.getFechaCorte()
      .pipe(takeUntilDestroyed())
      .subscribe(dia => {
        this.diaCorteActual.set(dia);
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  async guardarFechaCorte() {
    if (this.fechaCorteForm.valid && this.fechaCorteForm.value.fechaCorte) {
      try {
        const fechaCompleta = this.fechaCorteForm.value.fechaCorte;
        const dia = fechaCompleta.split('-')[2];

        await this.fechacorteService.guardarFechaCorte(dia);
        console.log('¡Día de corte guardado con éxito!', dia);
        this.fechaCorteForm.reset();

      } catch (error) {
        console.error('Error al guardar el día de corte:', error);
      }
    }
  }
}
