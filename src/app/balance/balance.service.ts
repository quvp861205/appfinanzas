import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Database, ref, push, listVal, remove, update, query } from '@angular/fire/database';
import { EMPTY, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';

export interface Movimiento {
  id?: string;
  monto: number;
  descripcion: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private db = inject(Database);
  private authService = inject(AuthService);

  private movimientosSignal = signal<Movimiento[]>([]);
  public movimientos = this.movimientosSignal.asReadonly();

  constructor() {
    // Para reaccionar a los cambios de sesión (login/logout), convertimos el 
    // signal del uid a un observable.
    toObservable(this.authService.uid$).pipe(
      switchMap(uid => {
        if (uid) {
          // Si hay un uid, conectamos al stream de sus movimientos.
          return this.conectarAStreamDeMovimientos(uid);
        } else {
          // Si no hay uid, vaciamos la lista de movimientos.
          this.movimientosSignal.set([]);
          return of(null);
        }
      })
    ).subscribe();
  }

  private conectarAStreamDeMovimientos(uid: string) {
    const userMovimientosRef = ref(this.db, `gastos/${uid}`);
    const movimientosQuery = query(userMovimientosRef);
    
    return listVal<Movimiento>(movimientosQuery, { keyField: 'id' }).pipe(
      map(movimientos => [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha))),
      tap(movimientos => {
        this.movimientosSignal.set(movimientos);
      }),
      catchError(err => {
        console.error('Servicio: Error en el stream de gastos:', err);
        return EMPTY;
      })
    );
  }
}
