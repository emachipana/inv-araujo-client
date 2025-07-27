import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgStyle, TitleCasePipe } from '@angular/common';
import { map } from 'rxjs';
import { SideItemComponent } from "./side-item/side-item.component";
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { DataService } from '../../services/data.service';

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

  currentTab: string = '';
  currentUser = this._authService.currentUser$.value;
  name: string = this.currentUser?.fullName.toLocaleLowerCase().split(" ").slice(0, 3).join(" ") || "";

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
      // This is the base profile route (/perfil)
      this.currentTab = '';
    } else {
      this.currentTab = urlSegments[profileIndex + 1];
    }
  }

  onTabChange(tab: string): void {
    if (tab === 'logout') {
      this._authService.logout();
      this._router.navigate(['/']);
      return;
    }

    // For empty tab (account), navigate to base profile URL
    if (tab === '') {
      this._router.navigate(['/perfil']);
    } else {
      this._router.navigate(['/perfil', tab]);
    }
  }

  getHeaderData() {
    // Check for order detail route first
    if (this.currentTab.startsWith('pedidos/')) {
      return this.headerData['pedidos/:id'] || this.headerData['pedidos'];
    }
    // For empty tab (account), use 'cuenta' as the key
    const tabKey = this.currentTab === '' ? 'cuenta' : this.currentTab;
    console.log(tabKey);
    return this.headerData[tabKey] || this.headerData['cuenta'];
  }
}
