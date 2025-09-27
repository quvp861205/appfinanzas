import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user, UserCredential } from '@angular/fire/auth';
import { EMPTY, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private provider = new GoogleAuthProvider();
  private uid = signal<string>('');

  // Hacemos una versión de solo lectura del signal uid para uso externo y reactivo.
  public readonly uid$ = this.uid.asReadonly();

  readonly user$ = user(this.auth);
  public readonly currentUser = toSignal(this.user$);

  constructor() {
    const storedUid = localStorage.getItem('uid');
    if (storedUid) {
      this.uid.set(storedUid);
    }
  }

  // getUID sigue siendo útil para obtener el valor actual de forma síncrona.
  getUID() {
    return this.uid();
  }

  setUID(uid: string) {
    this.uid.set(uid);
    if (uid) {
      localStorage.setItem('uid', uid);
    } else {
      localStorage.removeItem('uid');
    }
  }

  loginConGoogle() {
    return from(signInWithPopup(this.auth, this.provider)).pipe(
      tap((credential: UserCredential) => {
        this.setUID(credential.user.uid);
      }),
      catchError(err => {
        this.setUID(''); // Limpia el estado en caso de error
        console.error('Error al iniciar sesión con Google:', err);
        return EMPTY;
      })
    );
  }

  logout() {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.setUID(''); // Centraliza la limpieza del estado
      }),
      catchError(err => {
        console.error('Error al cerrar sesión:', err);
        return EMPTY;
      })
    );
  }
}
