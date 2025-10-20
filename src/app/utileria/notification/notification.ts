import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  template: `
    @if (message(); as msg) {
      <div 
        class="notification" 
        [class.error]="isError()" 
        [class.show]="isVisible()">
        {{ msg }}
      </div>
    }
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 12px; 
      background-color: rgba(13, 110, 253, 0.75); /* Blue with 75% opacity */
      color: white;
      font-family: 'Roboto', sans-serif;
      font-size: 16px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      z-index: 1050; 
      transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
      transform: translateX(120%);
      backdrop-filter: blur(10px) saturate(180%);
      -webkit-backdrop-filter: blur(10px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      opacity: 0;
    }
    
    .notification.error {
      background-color: rgba(244, 67, 54, 0.75); /* Red with 75% opacity */
    }

    .notification.show {
      transform: translateX(0);
      opacity: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);
  
  protected isVisible = signal(false);
  protected message = signal<string | null>(null);
  protected isError = signal(false);

  constructor() {
    effect((onCleanup) => {
      const serviceMessage = this.notificationService.message();
      const serviceError = this.notificationService.isError();
      
      if (serviceMessage) {
        this.message.set(serviceMessage);
        this.isError.set(serviceError);
        
        const timer = setTimeout(() => {
            this.isVisible.set(true);
        }, 10);

        onCleanup(() => clearTimeout(timer));

      } else if (this.message()) { // Only trigger exit if there is a message to hide
        this.isVisible.set(false);

        const clearTimer = setTimeout(() => {
            this.message.set(null);
        }, 400); // This duration must match the CSS transition time

        onCleanup(() => clearTimeout(clearTimer));
      }
    });
  }
}
