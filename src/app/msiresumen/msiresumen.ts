import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MsiresumenService } from './msiresumen.service';

@Component({
  selector: 'app-msiresumen',
  imports: [CommonModule],
  templateUrl: './msiresumen.html',
  styleUrl: './msiresumen.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Msiresumen {
  private msiresumenService = inject(MsiresumenService);
  private dialogRef = inject(MatDialogRef<Msiresumen>);

  public resumenMSI = this.msiresumenService.resumenMSI;

  close(): void {
    this.dialogRef.close();
  }
}
