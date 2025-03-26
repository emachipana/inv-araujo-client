import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';

@Component({
  selector: 'products-section',
  standalone: true,
  imports: [SpinnerComponent, ProductCardComponent],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss'
})
export class ProductsSectionComponent implements OnInit {
  _dataService = inject(DataService);
  toast = inject(HotToastService);
  isLoading = false;

  ngOnInit(): void {
    if(this._dataService.controller.discounts) return;
    this.isLoading = true;

    this._dataService.loadProductsWithDiscounts().subscribe({
      next: ((_response) => {
        // setTimeout(() => this.isLoading = false, 3000);
        this.isLoading = false;
      }),
      error: ((error) => {
        this.isLoading = false;
        this.toast.error(error.error.message);
      })
    });
  }
}
