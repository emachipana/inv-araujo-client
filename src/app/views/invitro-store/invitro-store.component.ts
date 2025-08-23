import { CurrencyPipe, NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { InvitroRequest } from '../../shared/models/InvitroRequest';
import { ProfileService } from '../../services/profile.service';
import { MatIconModule } from '@angular/material/icon';
import { InvitroService } from '../../services/invitro.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { Variety } from '../../shared/models/Variety';
import { VarietyComponent } from "./variety/variety.component";
import { OrderVariety } from '../../shared/models/OrderVariety';
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";
import { LoginModalService } from '../../services/login-modal.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from "../../shared/ui/buttons/button/button.component";
import { OrderVarietyComponent } from './order-variety/order-variety.component';
import { InputComponent } from "../../shared/ui/input/input.component";
import { DataService } from '../../services/data.service';
import { PaymentComponent } from './payment/payment.component';
@Component({
  selector: 'app-invitro-store',
  standalone: true,
  imports: [NgClass, NgStyle, MatIconModule, VarietyComponent, CurrencyPipe, SpinnerComponent, ButtonComponent, OrderVarietyComponent, InputComponent, PaymentComponent],
  templateUrl: './invitro-store.component.html',
  styleUrl: './invitro-store.component.scss'
})
export class InvitroStoreComponent implements OnInit {
  currentTab: "varieties" | "checkout" | "success" = "varieties";
  _invitroService = inject(InvitroService);
  _dataService = inject(DataService);
  isLoading = false;
  _toast = inject(HotToastService);
  _loginModalService = inject(LoginModalService);
  _authService = inject(AuthService);
  _profileService = inject(ProfileService);
  route = inject(ActivatedRoute);
  router = inject(Router)
  totalPlants = 0;
  months = 0;
  minDate: string = '';
  totalAmount = 0;
  totalWithoutIgv = 0;
  orderDate: string = "";
  isLoadingOrder = false;
  orderId: number = 0;
  
  get varietiesSelected() {
    return this._invitroService.varietiesToOrder$;
  }

  ngOnInit(): void {
    this.updateMinDate();
    this.isLoading = true;
    this._invitroService.loadVarieties().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this._toast.error(error.error.message);
        this.isLoading = false;
      }
    });

    this.route.queryParams.subscribe(params => {
      let tab = params['tab'];
      if(tab === "checkout" && this.varietiesSelected.value.length === 0) {
        tab = "varieties";
        this._toast.warning("Elige almenos una variedad");
      }

      if(tab === "success" && this.orderId <= 0) tab = "checkout";

      this.currentTab = tab ? tab : "varieties";
      this.router.navigate([], {queryParams: {tab: this.currentTab}});
    });

    this._invitroService.varietiesToOrder$.subscribe(() => {
      if(this.varietiesSelected.value.length === 0 && this.currentTab === "checkout" && this.orderId <= 0) {
        this.currentTab = "varieties";
        this.router.navigate([], {queryParams: {tab: this.currentTab}});
        this._toast.warning("Elige almenos una variedad");
        return;
      }

      this.totalPlants = this.varietiesSelected.value.reduce((acc, variety) => acc + variety.quantity, 0);
      this.months = Math.ceil(this.totalPlants / 8000);
      this.updateMinDate();
      this.totalAmount = this.varietiesSelected.value.reduce((acc, variety) => acc + variety.quantity * variety.variety.price, 0);
      this.totalWithoutIgv = (this.totalAmount / 2) / 1.18;
    });
  }

  changeTab(tab: "varieties" | "checkout") {
    if(tab === "checkout" && this.varietiesSelected.value.length === 0) {
      this._toast.warning("Elige almenos una variedad");
      return;
    }

    this.currentTab = tab;
    this.router.navigate([], {queryParams: {tab: tab}});
  }

  varietyIsSelected(variety: Variety): boolean {
    return !!this.varietiesSelected.value.find(v => v.variety.id === variety.id);
  }

  onClickCard(variety: OrderVariety) {
    const currentVarieties = this.varietiesSelected.value;
    const found = currentVarieties.find(v => v.variety.id === variety.id);
    if (found) {
      this._invitroService.varietiesToOrder$.next(
        currentVarieties.filter(v => v.variety.id !== variety.id)
      );
    } else {
      this._invitroService.varietiesToOrder$.next([...currentVarieties, variety]);
    }
  }

  private updateMinDate(): void {
    const today = new Date();
    today.setMonth(today.getMonth() + this.months);
    this.minDate = today.toISOString().split('T')[0];
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const date = input.value;
    
    this._invitroService.checkDate(date, this.totalPlants).subscribe({
      next: (response) => {
        if(!response.isAvailable) {
          this._toast.error(response.message);
          input.value = '';
        } else {
          this._toast.success(response.message);
          this.orderDate = date;
        }
      },
      error: (error) => {
        this._toast.error(error.error.message);
        input.value = '';
      }
    });
  }

  onOrderDetail(): void {
    if(this._authService.isLoggedIn()) {
      this.router.navigate([`/perfil/invitro/${this.orderId}`]);
    }
  }

  onPay() {
    if(!this._authService.isLoggedIn()) {
      this._loginModalService.open("login", true, "invitro/pedido");
      this._toast.warning("Debes iniciar sesión primero");
      return;
    }

    this.isLoadingOrder = true;
    
    const initDate = new Date().toISOString().split('T')[0];
    const finishDate = this.orderDate;
    const request: InvitroRequest = {
      clientId: this._authService.currentUser$.value?.clientId || 0,
      initDate,
      finishDate
    };
    
    this._invitroService.registerOrder(
      request,
      this._invitroService.varietiesToOrder$.value,
      this.totalAmount / 2,
      'TARJETA_ONLINE'
    ).subscribe({
      next: (order) => {
        this._profileService.vitroOrders.update(orders => [...orders, order]);
        this.orderId = order.id;
        this.isLoadingOrder = false;
        this._toast.success("Pedido generado exitosamente");
        this.router.navigate([], {queryParams: {tab: "success"}});
        this._invitroService.varietiesToOrder$.next([]);
        this._profileService.cachedVitroOrders = {};
      },
      error: (error) => {
        this._toast.error(error.error.message);
        this.isLoadingOrder = false;
      }
    });
  }
}
