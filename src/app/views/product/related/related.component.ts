import { Component, inject, Input, OnInit } from '@angular/core';
import { SpinnerComponent } from "../../../shared/ui/spinner/spinner.component";
import { ProductCardComponent } from "../../../shared/ui/product-card/product-card.component";
import { DataService } from '../../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { Router } from '@angular/router';
import { Product } from '../../../shared/models/Product';

@Component({
  selector: 'app-related',
  standalone: true,
  imports: [SpinnerComponent, ProductCardComponent],
  templateUrl: './related.component.html',
  styleUrl: './related.component.scss'
})
export class RelatedComponent implements OnInit {
  @Input({required: true}) productId: number = 0;
  _dataService = inject(DataService);
  toast = inject(HotToastService);
  isLoading = false;
  router = inject(Router);
  products: Product[] = [];

  ngOnInit(): void {
    this.isLoading = true;

    this._dataService.getRelatedProducts(this.productId).subscribe({
      next: ((response) => {
        this.products = response;
        this.isLoading = false;
      }),
      error: ((error) => {
        this.isLoading = false;
        this.toast.error(error.error.message);
      })
    });
  }
}
