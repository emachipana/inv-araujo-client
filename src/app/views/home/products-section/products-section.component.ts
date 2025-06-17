import { Component, inject, Input, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'products-section',
  standalone: true,
  imports: [SpinnerComponent, ProductCardComponent],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss'
})
export class ProductsSectionComponent implements OnInit {
  @Input() size: number = 5;
  _dataService = inject(DataService);
  toast = inject(HotToastService);
  isLoading = false;
  router = inject(Router);

  ngOnInit(): void {
    if(this._dataService.controller.discounts) return;
    this.isLoading = true;

    this._dataService.loadProductsWithDiscounts(this.size).subscribe({
      next: ((_response) => {
        this.isLoading = false;
      }),
      error: ((error) => {
        this.isLoading = false;
        this.toast.error(error.error.message);
      })
    });
  }
}
