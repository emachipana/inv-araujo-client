import { Component, inject, OnInit } from '@angular/core';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationComponent } from "../../../../shared/ui/notification/notification.component";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [NotificationComponent, MatIconModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  _notiService = inject(NotificationService);
}
