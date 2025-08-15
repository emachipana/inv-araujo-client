import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Product } from '../../../../models/Product';
import { mainProductImg } from '../../../../helpers/main';
import { StatusBadgeComponent } from "../../../status-badge/status-badge.component";
import { CurrencyPipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [StatusBadgeComponent, CurrencyPipe, NgClass],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  @Input({required: true}) product: Product = {
    id: 0,
    name: "",
    description: "",
    brand: "",
    unit: "",
    price: 0,
    discount: null,
    stock: 0,
    images: [],
    categoryId: 0,
    categoryName: ""
  };
  @Output() onClick = new EventEmitter<void>;

  _router = inject(Router);

  mainImg = mainProductImg;

  redirect() {
    this._router.navigate(['/tienda/productos', this.product.id]);
    this.onClick.emit();
  }
}
