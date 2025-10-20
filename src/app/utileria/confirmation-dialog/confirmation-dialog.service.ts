import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  private dialog = inject(MatDialog);

  open(message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: message },
      width: '400px',
      disableClose: true, // User must click a button
      panelClass: 'transparent-dialog-container' // Custom class for the panel
    });

    return dialogRef.afterClosed();
  }
}
