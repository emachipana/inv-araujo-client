import { Component, inject, Input } from '@angular/core';
import { Notification, NotiType } from '../../models/Notification';
import { MatIconModule } from '@angular/material/icon';
import { Colors } from '../../../constants/index.constants';
import { DatePipe, NgStyle } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgStyle, MatIconModule, DatePipe],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  private _notificationService = inject(NotificationService);
  private router = inject(Router);

  @Input({required: true}) notification: Notification = {
    id: 0,
    createdAt: '',
    isRead: false,
    message: '',
    redirectTo: '',
    type: "CANCEL_REQUEST_APROVED"
  };

  color: Record<NotiType, {color: string, backgroundColor: string, icon: string}> = {
    CANCEL_REQUEST_APROVED: {
      color: Colors.blue,
      backgroundColor: Colors.blue_light,
      icon: "task"  
    },
    CANCEL_REQUEST_REJECTED: {
      color: Colors.red,
      backgroundColor: Colors.red_light,
      icon: "cancel_schedule_send"  
    },
    ORDER_DELIVERED: {
      color: Colors.persian,
      backgroundColor: Colors.persian_light,
      icon: "list_alt_check" 
    },
    VITRO_ORDER_DELIVERED: {
      color: Colors.persian,
      backgroundColor: Colors.persian_light,
      icon: "list_alt_check"      
    },
    ORDER_AT_AGENCY: {
      color: Colors.purple,
      backgroundColor: Colors.purple_light,
      icon: "local_shipping"    
    },
    VITRO_ORDER_AT_AGENCY: {
      color: Colors.purple,
      backgroundColor: Colors.purple_light,
      icon: "local_shipping"      
    },
    VITRO_ORDER_ALREADY: {
      color: Colors.persian,
      backgroundColor: Colors.persian_light,
      icon: "temp_preferences_eco"      
    },
  }

  get currentColor() {
    return this.color[this.notification.type];
  }

  handleClick() {
    this.router.navigate([this.notification.redirectTo]);
    this._notificationService.markAsRead(this.notification.id);
  }
}
