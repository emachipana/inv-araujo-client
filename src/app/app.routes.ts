import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { StoreComponent } from './views/store/store.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tienda', component: StoreComponent }
];
