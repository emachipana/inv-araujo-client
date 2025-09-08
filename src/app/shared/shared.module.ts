import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';

const PRIME_MODULES = [
  ButtonModule,
  CardModule,
  DividerModule,
  ProgressSpinnerModule,
  PaginatorModule,
  TagModule
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ...PRIME_MODULES
  ],
  exports: [
    ...PRIME_MODULES
  ]
})
export class SharedModule { }
