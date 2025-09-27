import { inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Database, ref, push, query, orderByChild, equalTo, get, update } from '@angular/fire/database';
import { EMPTY, of } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';
import { listVal } from '@angular/fire/database';

// Definimos la interfaz para un registro de MSI
export interface MsiRecord {
  id?: string; // El ID que asigna Firebase
  montototal: number;
  monto: number;
  descripcion: string;
  num_mes: number;
  meses: number;
  fecha: string; // Guardamos la fecha como ISO string (YYYY-MM-DD)
}

@Injectable({
  providedIn: 'root'
})
export class MsiService {
  private db = inject(Database);
  private authService = inject(AuthService);

  // Signal para gestionar el estado de los registros MSI
  private msiSignal = signal<MsiRecord[]>([]);
  public msi = this.msiSignal.asReadonly();

  constructor() {
    // Reacciona a los cambios en el UID del usuario
    toObservable(this.authService.uid$).pipe(
      switchMap(uid => {
        if (uid) {
          return this.conectarAStreamDeMsi(uid);
        } else {
          this.msiSignal.set([]);
          return of(null);
        }
      })
    ).subscribe();
  }

  // Se conecta al stream de datos de MSI del usuario
  private conectarAStreamDeMsi(uid: string) {
    const userMsiRef = ref(this.db, `msi/${uid}`);
    return listVal<MsiRecord>(userMsiRef, { keyField: 'id' }).pipe(
      tap(records => this.msiSignal.set(records)),
      catchError(err => {
        console.error('Servicio: Error en el stream de MSI:', err);
        return EMPTY;
      })
    );
  }

  // Crea los N registros para una nueva compra a MSI
  async createMsiRecords(record: { monto: number; descripcion: string; fecha: string; meses: number; }): Promise<void> {
    const uid = this.authService.getUID();
    if (!uid) {
      throw new Error("User not authenticated, cannot create MSI records.");
    }

    const userMsiRef = ref(this.db, `msi/${uid}`);
    const monthlyAmount = parseFloat((record.monto / record.meses).toFixed(2));
    const startDate = new Date(record.fecha + 'T00:00:00Z');

    for (let i = 1; i <= record.meses; i++) {
      const paymentDate = new Date(startDate.getTime());
      paymentDate.setUTCMonth(paymentDate.getUTCMonth() + (i - 1));
      const formattedDate = paymentDate.toISOString().split('T')[0];

      const newRecord: Omit<MsiRecord, 'id'> = {
        montototal: record.monto,
        monto: monthlyAmount,
        descripcion: record.descripcion,
        num_mes: i,
        meses: record.meses,
        fecha: formattedDate,
      };
      // Usamos await directamente en cada push
      await push(userMsiRef, newRecord);
    }
  }

  // Elimina todos los registros que coincidan con una descripción
  async deleteMsiByDescription(description: string): Promise<void> {
    const uid = this.authService.getUID();
    if (!uid) {
      throw new Error("User not authenticated");
    }

    const userMsiRef = ref(this.db, `msi/${uid}`);
    const recordsQuery = query(userMsiRef, orderByChild('descripcion'), equalTo(description));
    
    const snapshot = await get(recordsQuery);
    if (snapshot.exists()) {
      const updates: { [key: string]: null } = {};
      snapshot.forEach(childSnapshot => {
        if (childSnapshot.key) {
          updates[`msi/${uid}/${childSnapshot.key}`] = null;
        }
      });
      await update(ref(this.db), updates);
    }
  }
}
