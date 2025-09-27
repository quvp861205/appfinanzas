import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Database, listVal, push, ref, remove } from '@angular/fire/database';
import { EMPTY, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';

// Interfaz para el objeto Ingreso
export interface Ingreso {
  id?: string; // ID de Firebase (se inyecta automáticamente)
  monto: number;
  descripcion: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngresosService {
  private db = inject(Database);
  private authService = inject(AuthService);

  // Signal para gestionar el estado de los ingresos
  private ingresosSignal = signal<Ingreso[]>([]);
  public ingresos = this.ingresosSignal.asReadonly();

  constructor() {
    // Reacciona a los cambios en el UID del usuario
    toObservable(this.authService.uid$).pipe(
      switchMap(uid => {
        if (uid) {
          return this.conectarAStreamDeIngresos(uid);
        } else {
          this.ingresosSignal.set([]);
          return of(null);
        }
      })
    ).subscribe();
  }

  // Se conecta al stream de datos de ingresos del usuario
  private conectarAStreamDeIngresos(uid: string) {
    const userIngresosRef = ref(this.db, `ingresos/${uid}`);
    return listVal<Ingreso>(userIngresosRef, { keyField: 'id' }).pipe(
      map(ingresos => ingresos.sort((a, b) => b.fecha.localeCompare(a.fecha))),
      tap(ingresos => this.ingresosSignal.set(ingresos)),
      catchError(err => {
        console.error('Servicio: Error en el stream de ingresos:', err);
        return EMPTY;
      })
    );
  }

  // Agrega un nuevo ingreso usando el UID actual
  async addIngreso(ingreso: Omit<Ingreso, 'id'>): Promise<void> {
    const uid = this.authService.getUID();
    if (uid) {
      const userIngresosRef = ref(this.db, `ingresos/${uid}`);
      await push(userIngresosRef, ingreso);
    } else {
      throw new Error('User not authenticated');
    }
  }

  // Elimina un ingreso por su ID usando el UID actual
  async deleteIngreso(id: string): Promise<void> {
    const uid = this.authService.getUID();
    if (uid) {
      const ingresoToDeleteRef = ref(this.db, `ingresos/${uid}/${id}`);
      await remove(ingresoToDeleteRef);
    } else {
      throw new Error('User not authenticated');
    }
  }
}
