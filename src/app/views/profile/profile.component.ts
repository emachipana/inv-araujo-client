import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgStyle, TitleCasePipe } from '@angular/common';
import { map } from 'rxjs';
import { SideItemComponent } from "./side-item/side-item.component";
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    TitleCasePipe, 
    SideItemComponent, 
    NgStyle,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  _authService = inject(AuthService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _dataService = inject(DataService);
  _notiService = inject(NotificationService);

  currentTab: string = '';
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
    this._router.events.subscribe(() => {
      this.updateCurrentTab();
    });
    this.updateCurrentTab();
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
    
    const tabKey = this.currentTab === '' ? 'cuenta' : this.currentTab;
    return this.headerData[tabKey] || this.headerData['cuenta'];
  }
}
