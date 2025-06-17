import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgStyle, TitleCasePipe } from '@angular/common';
import { map } from 'rxjs';
import { SideItemComponent } from "./side-item/side-item.component";
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AccountComponent } from "./tabs/account/account.component";
import { OrdersComponent } from "./tabs/orders/orders.component";
import { UpdatePasswordComponent } from "./tabs/update-password/update-password.component";
import { NotificationsComponent } from "./tabs/notifications/notifications.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TitleCasePipe, SideItemComponent, NgStyle, AccountComponent, OrdersComponent, UpdatePasswordComponent, NotificationsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  _authService = inject(AuthService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _dataService = inject(DataService);

  currentTab: "cuenta" | "pedidos" | "contraseña" | "notificaciones" = "cuenta";
  currentUser = this._authService.currentUser$.value;
  name: string = this.currentUser?.fullName.toLocaleLowerCase().split(" ").slice(0, 3).join(" ") || "";

  headerData = {
    cuenta: {
      title: "Mi cuenta",
      subtitle: "Gestiona tu información personal"
    },
    pedidos: {
      title: "Mis pedidos",
      subtitle: "Revisa el historial de tus pedidos"
    },
    contraseña: {
      title: "Cambiar contraseña",
      subtitle: "Actualiza tu contraseña para mantener tu cuenta segura"
    },
    notificaciones: {
      title: "Notificaciones",
      subtitle: "Revisa el historial de tus notificaciones"
    }
  }

  ngOnInit(): void {
    this._route.queryParams.subscribe((params) => {
      const param = params['tab'];
      const isCorrect: boolean = ["cuenta", "pedidos", "contraseña", "notificaciones"].includes(param);

      this.currentTab = (param && isCorrect) ? param : "cuenta";

      if(!isCorrect) this._router.navigate([], {queryParams: {tab: "cuenta"}});
    });
  }

  onTabChange(tab: "cuenta" | "pedidos" | "contraseña" | "notificaciones" | "logout"): void {
    if(tab === "logout"){
      this._authService.logout();
      this._router.navigate(['/']);
      return;
    }

    this.currentTab = tab;
    this._router.navigate([], {queryParams: {tab: tab}});
  }
}
