import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  message = signal<string | null>(null);
  isError = signal<boolean>(false);

  show(message: string, isError = false) {
    this.message.set(message);
    this.isError.set(isError);
    setTimeout(() => this.clear(), 3000);
  }

  clear() {
    this.message.set(null);
    this.isError.set(false);
  }
}
