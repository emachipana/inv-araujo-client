import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, NgStyle, TitleCasePipe } from '@angular/common';
import { Router, RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../shared/models/User';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { SideItemComponent } from './side-item/side-item.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    NgStyle,
    RouterOutlet,
    RouterLink,
    TitleCasePipe,
    SideItemComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  _authService = inject(AuthService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _dataService = inject(DataService);
  _notiService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  currentTab: string = '';
  currentUser: User | null = null;
  unreadCount = 0;

  headerData: { [key: string]: { title: string; subtitle: string } } = {
    'cuenta': {
      title: "Mi cuenta",
      subtitle: "Gestiona tu información personal"
    },
    'pedidos': {
      title: "Mis pedidos",
      subtitle: "Revisa el historial de tus pedidos"
    },
    'pedidos/:id': {
      title: "Detalle del pedido",
      subtitle: "Revisa los detalles de tu pedido"
    },
    'invitro/:id': {
      title: "Detalle del pedido",
      subtitle: "Revisa los detalles de tu pedido invitro"
    },
    'contrasena': {
      title: "Cambiar contraseña",
      subtitle: "Actualiza tu contraseña para mantener tu cuenta segura"
    },
    'notificaciones': {
      title: "Notificaciones",
      subtitle: "Revisa el historial de tus notificaciones"
    },
    'facturacion': {
      title: "Facturación",
      subtitle: "Gestiona tus datos de facturación"
    }
  }

  ngOnInit(): void {
    this.updateCurrentTab();
    this._router.events.subscribe(() => {
      this.updateCurrentTab();
    });
    
    this.currentUser = this._authService.currentUser$.value;
    
    this._notiService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications: any[]) => {
        this.unreadCount = notifications.filter((n: any) => !n.isRead).length;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCurrentTab(): void {
    const urlSegments = this._router.url.split('/').filter(segment => segment !== '');
    const profileIndex = urlSegments.findIndex(segment => segment === 'perfil');
    
    if (profileIndex === -1 || profileIndex === urlSegments.length - 1) {
      this.currentTab = '';
    } else {
      // Get the segment after 'perfil'
      const nextSegment = urlSegments[profileIndex + 1];
      
      // Special handling for order details
      if (nextSegment === 'pedidos' && urlSegments.length > profileIndex + 2) {
        // This is a nested route like 'pedidos/123'
        this.currentTab = `pedidos/${urlSegments[profileIndex + 2]}`;
      } else if (nextSegment === 'invitro' && urlSegments.length > profileIndex + 2) {
        this.currentTab = `invitro/${urlSegments[profileIndex + 2]}`;
      } else {
        this.currentTab = nextSegment;
      }
    }
  }

  onTabChange(tab: string): void {
    if (tab === 'logout') {
      this._authService.logout();
      this._router.navigate(['/']);
      return;
    }

    if (tab === '') {
      this._router.navigate(['/perfil']);
    } else {
      this._router.navigate(['/perfil', tab]);
    }
  }

  getHeaderData() {
    if (this.currentTab.startsWith('pedidos/')) {
      return this.headerData['pedidos/:id'] || this.headerData['pedidos'];
    }
    
    if (this.currentTab.startsWith('invitro/')) {
      return this.headerData['invitro/:id'] || this.headerData['invitro'];
    }
    
    const tabKey = this.currentTab === '' ? 'cuenta' : this.currentTab;
    return this.headerData[tabKey] || this.headerData['cuenta'];
  }
}
