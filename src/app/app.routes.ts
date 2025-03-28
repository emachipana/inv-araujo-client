import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { StoreComponent } from './views/store/store.component';
import { ProductComponent } from './views/product/product.component';
import { CartComponent } from './views/cart/cart.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tienda', component: StoreComponent },
  { path: 'tienda/productos/:id', component: ProductComponent },
  { path: 'carrito', component: CartComponent },
];
