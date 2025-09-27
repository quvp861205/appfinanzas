import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BalanceMensualService } from './balance-mensual.service';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-balancemensual',
  imports: [CommonModule],
  templateUrl: './balancemensual.component.html',
  styleUrls: ['./balancemensual.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceMensualComponent {
  private balanceMensualService = inject(BalanceMensualService);
  private dialogRef = inject(MatDialogRef<BalanceMensualComponent>);

  public balanceMensual = this.balanceMensualService.balanceMensual;

  close(): void {
    this.dialogRef.close();
  }
}
