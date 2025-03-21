import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CarouselModule } from 'primeng/carousel';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { Router } from '@angular/router';

@Component({
  selector: 'categories-section',
  standalone: true,
  imports: [SpinnerComponent, CarouselModule],
  templateUrl: './categories-section.component.html',
  styleUrl: './categories-section.component.scss'
})
export class CategoriesSectionComponent implements OnInit {
  _dataService = inject(DataService);
  toast = inject(HotToastService);
  router = inject(Router);
  isLoading = false;

  ngOnInit(): void {
    if(this._dataService.controller.categories) return;
    this.isLoading = true;

    this._dataService.loadCategories().subscribe({
      next: ((_response) => {
        // setTimeout(() => this.isLoading = false, 5000);
        this.isLoading = false;
      }),
      error: ((error) => {
        this.isLoading = false;
        this.toast.error(error.error.message);
      })
    });
  }

  handleClick(categoryName: string): void {
    this.router.navigate(["/tienda"], categoryName === "all" ? {} : {queryParams: { category: categoryName.toLowerCase().split(" ").join("-") } });
  }
}
