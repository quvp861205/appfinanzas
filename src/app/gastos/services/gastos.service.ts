import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Database, ref, push, listVal, remove, update, query } from '@angular/fire/database';
import { limitToLast, orderByChild } from 'firebase/database';
import { EMPTY, of, combineLatest } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';

export interface Gasto {
  id?: string;
  monto: number;
  descripcion: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private db = inject(Database);
  private authService = inject(AuthService);

  private gastosSignal = signal<Gasto[]>([]);
  public gastos = this.gastosSignal.asReadonly();
  private limit = signal(30);

  constructor() {
    const uid$ = toObservable(this.authService.uid$);
    const limit$ = toObservable(this.limit);

    combineLatest([uid$, limit$]).pipe(
      switchMap(([uid, limit]) => {
        if (uid) {
          return this.conectarAStreamDeMovimientos(uid, limit);
        } else {
          this.gastosSignal.set([]);
          return of(null);
        }
      })
    ).subscribe();
  }

  setLimit(newLimit: number): void {
    this.limit.set(newLimit);
  }

  private conectarAStreamDeMovimientos(uid: string, limit: number) {
    const userMovimientosRef = ref(this.db, `gastos/${uid}`);
    const movimientosQuery = query(userMovimientosRef, orderByChild('fecha'), limitToLast(limit));
    
    return listVal<Gasto>(movimientosQuery, { keyField: 'id' }).pipe(
      map(movimientos => [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha))),
      tap(movimientos => {
        this.gastosSignal.set(movimientos);
      }),
      catchError(err => {
        console.error('Servicio: Error en el stream de gastos:', err);
        return EMPTY;
      })
    );
  }

  async agregarGasto(movimiento: Omit<Gasto, 'id'>): Promise<void> {
    const uid = this.authService.getUID();
    if (uid) {
      const userMovimientosRef = ref(this.db, `gastos/${uid}`);
      await push(userMovimientosRef, movimiento);
    } else {
      console.error("No user logged in, cannot add movement.");
      throw new Error("User not authenticated");
    }
  }

  async actualizarGasto(id: string, movimiento: Partial<Gasto>): Promise<void> {
    const uid = this.authService.getUID();
    if (uid) {
        const movimientoRef = ref(this.db, `gastos/${uid}/${id}`);
        return update(movimientoRef, movimiento);
    }
    throw new Error("User not authenticated");
  }

  async eliminarGasto(id: string): Promise<void> {
    const uid = this.authService.getUID();
     if (uid) {
        const movimientoRef = ref(this.db, `gastos/${uid}/${id}`);
        try {
            await remove(movimientoRef);
        } catch (error) {
            console.error(`Servicio: Error al ejecutar 'remove' para el ID: ${id}`, error);
            throw error;
        }
     } else {
        throw new Error("User not authenticated");
     }
  }
}
