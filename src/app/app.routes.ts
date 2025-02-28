import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './views/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pedidos', component: Type, canActivate: [AuthGuard] }
];
