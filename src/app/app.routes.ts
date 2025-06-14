import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { StoreComponent } from './views/store/store.component';
import { ProductComponent } from './views/product/product.component';
import { CartComponent } from './views/cart/cart.component';
import { RegisterComponent } from './views/register/register.component';
import { registrationGuard } from './guards/registration.guard';
import { ProfileComponent } from './views/profile/profile.component';
import { authGuard } from './guards/auth.guard';

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
    canActivate: [authGuard]
  }
];
