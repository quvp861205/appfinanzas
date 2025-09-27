import { Injectable, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FocoService {
  public foco = signal<boolean>(false);

}
