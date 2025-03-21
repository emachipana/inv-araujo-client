import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { CategoryItemComponent } from "./category-item/category-item.component";
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [SpinnerComponent, CategoryItemComponent, ProductCardComponent, NgStyle],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit {
  _dataService = inject(DataService);
  router = inject(Router);
  toast = inject(HotToastService);
  currentCategory: number = -1;
  isLoading = false;
  isCategoriesLoading = false;

  ngOnInit(): void {
    if(!this._dataService.controller.categories) {
      this.isCategoriesLoading = true;
  
      this._dataService.loadCategories().subscribe({
        next: ((categories) => {
          const categoryName: String = this.router.parseUrl(this.router.url).queryParams["category"];
          const findedCategory = categories.find((category) => category.name.toLowerCase().split(" ").join("-") === categoryName);
          this.currentCategory = !findedCategory ? -1 : findedCategory.id;
          this.isCategoriesLoading = false;
        }),
        error: ((error) => {
          this.isCategoriesLoading = false;
          this.toast.error(error.error.message);
        })
      });
    }

    if(!this._dataService.controller.products) {
      this.isLoading = true;

      this._dataService.loadProducts({categoryId: this.currentCategory < 0 ? undefined : this.currentCategory, maxPrice: undefined, minPrice: undefined, page: 0}).subscribe({
        next: ((_products) => {
          this.isLoading = false;
        }),
        error: ((error) => {
          this.isLoading = false;
          this.toast.error(error.error.message);
        }),
      });
    }
  }
}
