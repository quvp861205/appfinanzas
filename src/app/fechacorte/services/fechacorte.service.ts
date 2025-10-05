import { Injectable, inject } from '@angular/core';
import { Database, ref, set, get } from '@angular/fire/database';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FechacorteService {
  private db = inject(Database);
  private authService = inject(AuthService);

  constructor() { }

  guardarFechaCorte(fecha: string): Promise<void> {
    const uid = this.authService.getUID();
    if (!uid) {
      return Promise.reject('User not authenticated');
    }
    const fechaCorteRef = ref(this.db, `fechacorte/${uid}`);
    return set(fechaCorteRef, fecha);
  }

  async getFechaCorte(): Promise<string | null> {
    const uid = this.authService.getUID();
    if (!uid) {
      return null;
    }
    const fechaCorteRef = ref(this.db, `fechacorte/${uid}`);
    const snapshot = await get(fechaCorteRef);
    return snapshot.exists() ? snapshot.val() : null;
  }
}
