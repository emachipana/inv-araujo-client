import { Component, Input } from '@angular/core';
import { Product } from '../../../../../../shared/models/Product';
import { mainProductImg } from '../../../../../../shared/helpers/main';
import { StatusBadgeComponent } from "../../../../../../shared/ui/status-badge/status-badge.component";

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product: Product = {
    id: 0,
    name: "",
    brand: "",
    categoryId: 0,
    categoryName: "",
    description: "",
    discount: null,
    images: [],
    price: 0,
    stock: 0,
    unit: ""
  };
  @Input({ required: true }) quantity: number = 0;
  @Input({ required: true }) productPrice: number = 0;

  getImage = mainProductImg;
}
