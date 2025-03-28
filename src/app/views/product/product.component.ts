import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { SpinnerComponent } from "../../shared/ui/spinner/spinner.component";
import { CategoryItemComponent } from "../store/category-item/category-item.component";
import { NgClass, NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { mainProductImg, parseCategory } from '../../shared/helpers/main';
import { Product } from '../../shared/models/Product';
import { Category } from '../../shared/models/Category';
import { CarouselModule } from 'primeng/carousel';
import { QuantityComponent } from "../../shared/ui/quantity/quantity.component";
import { ButtonComponent } from "../../shared/ui/buttons/button/button.component";
import { CartService } from '../../services/cart.service';
import { ProductCart } from '../../shared/models/ProductCart';
import { RelatedComponent } from "./related/related.component";

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [SpinnerComponent, CategoryItemComponent, NgStyle, CarouselModule, NgClass, QuantityComponent, ButtonComponent, RelatedComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  _dataService = inject(DataService);
  isLoading: boolean = false;
  isCategoriesLoading: boolean = false;
  currentCategory: number = -1;
  product?: Product;
  _cartService = inject(CartService);
  foundProductOnCart: ProductCart | undefined;
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(HotToastService);
  private numToAdd: number = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
        this._cartService.items$.subscribe(() => {
          this.foundProductOnCart = this._cartService.findItemOnCart(productId);
        });
      }
    });

    if (!this._dataService.controller.categories) {
      this.isCategoriesLoading = true;
      this._dataService.loadCategories().subscribe({
        next: (categories) => {
          this.isCategoriesLoading = false;
          this.setCurrentCategory(categories);
        },
        error: (error) => {
          this.isCategoriesLoading = false;
          this.toast.error(error.error.message);
        }
      });
    } else {
      this.setCurrentCategory(this._dataService.categories());
    }
  }

  loadProduct(productId: number): void {
    this.isLoading = true;
    this._dataService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        if (this._dataService.controller.categories) {
          this.setCurrentCategory(this._dataService.categories());
        }
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('No se pudo cargar el producto.');
        this.isLoading = false;
      }
    });
  }

  setCurrentCategory(categories: Category[]): void {
    if (this.product?.categoryName) {
      const foundCategory = categories.find(
        (category) => parseCategory(category.name) === parseCategory(this.product!.categoryName)
      );
      this.currentCategory = foundCategory ? foundCategory.id : -1;
    }
  }

  onCategoryName(categoryName: String): void {
    this.router.navigate(["/tienda"], categoryName === "all" ? {} : { queryParams: { category: parseCategory(categoryName) } });
  }

  onMinus(num: number): void {
    this.numToAdd = num;
    console.log(num);
  }

  onPlus(num: number): void {
    this.numToAdd = num;
    console.log(num);
  }

  addToCart(): void {
    const data: ProductCart = {
      id: this.product?.id ?? 0,
      name: this.product?.name ?? "",
      price: this.product?.price ?? 0,
      quantity: this.numToAdd,
      discountPercentage: this.product?.discount?.percentage,
      discountPrice: this.product?.discount?.price,
      mainImg: mainProductImg(this.product?.images[0]),
      maxQuantity: this.product?.stock ?? 0,
    }

    this._cartService.addToCart(data);
    this._cartService.productOnModal.set(data);
    this._cartService.cartModalIsOpen = true;
  }
}
