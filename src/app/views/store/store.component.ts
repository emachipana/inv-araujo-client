import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { CategoryItemComponent } from "./category-item/category-item.component";
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';
import { NgStyle } from '@angular/common';
import { Category } from '../../shared/models/Category';
import { parseCategory } from '../../shared/helpers/main';
import { CartService } from '../../services/cart.service';
import { PaginatorModule } from 'primeng/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectComponent } from "../../shared/ui/select/select.component";
import { InputComponent } from "../../shared/ui/input/input.component";
import { ButtonComponent } from "../../shared/ui/buttons/button/button.component";

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [SpinnerComponent, CategoryItemComponent, ProductCardComponent, NgStyle, PaginatorModule, SelectComponent, InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit {
  _dataService = inject(DataService);
  _cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(HotToastService);
  currentCategory: number = -1;
  isLoading = false;
  isCategoriesLoading = false;
  minPrice: number = 0;
  maxPrice: number = 0;

  form = new FormGroup({
    minPrice: new FormControl(0),
    maxPrice: new FormControl(0),
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const minPrice = params['minPrice'] ? Number(params['minPrice']) : undefined;
      const maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : undefined;

      this.form.setValue({ minPrice: minPrice ?? 0, maxPrice: maxPrice ?? 0 }, { emitEvent: false });

      this.loadCategoriesAndProducts(minPrice, maxPrice);
    });
  }
  
  loadCategoriesAndProducts(minPrice?: number, maxPrice?: number): void {
    if (!this._dataService.controller.categories) {
      this.isCategoriesLoading = true;
      
      this._dataService.loadCategories().subscribe({
        next: (categories) => {
          this.isCategoriesLoading = false;
          this.currentCategory = this.getCurrentCategory(categories);
          this.loadProducts(minPrice, maxPrice);
        },
        error: (error) => {
          this.isCategoriesLoading = false;
          this.toast.error(error.error.message);
        }
      });
    } else {
      this.currentCategory = this.getCurrentCategory(this._dataService.categories());
      this.loadProducts(minPrice, maxPrice);
    }
  }
  
  loadProducts(minPrice?: number, maxPrice?: number): void {
    const cacheKey = `category-${this.currentCategory}-min-${minPrice ?? 'null'}-max-${maxPrice ?? 'null'}`;
  
    if (this._dataService.cachedProducts[cacheKey]) {
      this._dataService.products.set({
        ...this._dataService.products(),
        content: this._dataService.cachedProducts[cacheKey]
      });      
      return;
    }
  
    this.isLoading = true;
  
    this._dataService.loadProducts({
      categoryId: this.currentCategory < 0 ? undefined : this.currentCategory,
      maxPrice: maxPrice,
      minPrice: minPrice,
      page: 0
    }).subscribe({
      next: (products) => {
        this._dataService.cachedProducts[cacheKey] = products.content;
        this._dataService.products.set(products); // Actualiza los productos
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toast.error(error.error.message);
      },
    });
  }
  
  updateFilters({ minPrice, maxPrice, categoryName }: { minPrice?: number, maxPrice?: number, categoryName?: string }): void {
    const currentParams = this.route.snapshot.queryParams;
    if (categoryName) {
      this.currentCategory = this.getCurrentCategory(this._dataService.categories());
    }
  
    this.router.navigate([], {
      queryParams: {
        minPrice: minPrice ?? currentParams['minPrice'] ?? null,
        maxPrice: maxPrice ?? currentParams['maxPrice'] ?? null,
        category: categoryName ? (categoryName === "all" ? undefined : parseCategory(categoryName)) : currentParams["category"] ?? undefined,
      },
      queryParamsHandling: 'merge'
    });
  }
  

  updatePriceFilter(): void {
    if(!this.form.valid) return;

    const minPrice = this.form.value.minPrice;
    const maxPrice = this.form.value.maxPrice;

    this.updateFilters({minPrice: minPrice ?? undefined, maxPrice: maxPrice ?? undefined});
  }

  getCurrentCategory(categories: Category[]): number {
    const categoryName: string = this.router.parseUrl(this.router.url).queryParams["category"];
    const foundCategory = categories.find((category) => parseCategory(category.name) === categoryName);
    return foundCategory ? foundCategory.id : -1;
  }
}
