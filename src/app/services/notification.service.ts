import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Client, IMessage } from '@stomp/stompjs';
import { AuthService } from './auth.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ApiResponse } from '../shared/models/ApiResponse';
import { Notification } from '../shared/models/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private _http = inject(HttpClient);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();
  private stompClient: Client | null = null;
  private isConnected = false;
  
  notifications$ = new BehaviorSubject<Notification[]>([]);

  constructor() {
    this.initializeWebSocketConnection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  private initializeWebSocketConnection(): void {
    this.authService.currentUser$
      .pipe(
        filter(user => !!user),
        takeUntil(this.destroy$)
      )
      .subscribe(user => {
        if (user) {
          this.connectWebSocket(user.id.toString());
          this.loadUserNotifications();
        } else {
          this.disconnect();
          this.notifications$.next([]);
        }
      });
  }

  private connectWebSocket(userId: string): void {
    if (this.isConnected) return;

    const wsUrl = environment.base_uri.replace('http', 'ws') + '/ws';
    this.stompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      this.isConnected = true;
      console.log('Connected to WebSocket');
      
      this.stompClient?.subscribe(
        `/topic/notifications/${userId}`,
        (message: IMessage) => {
          const notification = JSON.parse(message.body);
          console.log(notification);
          this.addNotification(notification);
        }
      );
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.stompClient.activate();
  }

  private disconnect(): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.deactivate();
      this.isConnected = false;
    }
  }

  private loadUserNotifications(): void {
    this._http.get<ApiResponse<Notification[]>>(`${environment.base_uri}/notifications/getByUser`)
      .subscribe({
        next: (notifications) => {
          this.notifications$.next(notifications.data || []);
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications$.getValue();
    this.notifications$.next([notification, ...currentNotifications]);
    
    this.playNotificationSound();
  }

  private playNotificationSound(): void {
    const audio = new Audio('/sound/notification.wav');
    audio.play().catch(error => console.error('Error playing notification sound:', error));
  }

  markAsRead(notificationId: number): void {
    this._http.put(`${environment.base_uri}/notifications/${notificationId}/read`, {})
      .subscribe({
        next: () => {
          const updated = this.notifications$.getValue().map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          );
          this.notifications$.next(updated);
        },
        error: (error) => console.error('Error marking notification as read:', error)
      });
  }
}
