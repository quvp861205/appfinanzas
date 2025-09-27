import { Injectable, inject } from '@angular/core';
import { Database, objectVal, ref, set } from '@angular/fire/database';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FechacorteService {
  private db = inject(Database);
  private authService = inject(AuthService);

  constructor() { }

  guardarFechaCorte(fecha: string): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      return Promise.reject('User not authenticated');
    }
    const fechaCorteRef = ref(this.db, `fechacorte/${user.uid}`);
    return set(fechaCorteRef, fecha);
  }

  getFechaCorte(): Observable<string | null> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (user) {
          const fechaCorteRef = ref(this.db, `fechacorte/${user.uid}`);
          return objectVal<string>(fechaCorteRef);
        } else {
          return of(null);
        }
      })
    );
  }
}
