import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { StoreComponent } from './views/store/store.component';
import { ProductComponent } from './views/product/product.component';
import { CartComponent } from './views/cart/cart.component';
import { RegisterComponent } from './views/register/register.component';
import { registrationGuard } from './guards/registration.guard';
import { ProfileComponent } from './views/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { AccountComponent } from './views/profile/tabs/account/account.component';
import { OrdersComponent } from './views/profile/tabs/orders/orders.component';
import { UpdatePasswordComponent } from './views/profile/tabs/update-password/update-password.component';
import { NotificationsComponent } from './views/profile/tabs/notifications/notifications.component';
import { OrderDetailComponent } from './views/profile/tabs/orders/order-detail/order-detail.component';
import { InvoiceComponent } from './views/profile/tabs/invoice/invoice.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tienda', component: StoreComponent },
  { path: 'tienda/productos/:id', component: ProductComponent },
  { path: 'carrito', component: CartComponent },
  { 
    path: 'registro', 
    component: RegisterComponent,
    canActivate: [registrationGuard]
  },
  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: AccountComponent },
      { path: 'pedidos', component: OrdersComponent },
      { path: 'pedidos/:id', component: OrderDetailComponent },
      { path: 'contrasena', component: UpdatePasswordComponent },
      { path: 'notificaciones', component: NotificationsComponent },
      { path: 'facturacion', component: InvoiceComponent }
    ]
  }
];
