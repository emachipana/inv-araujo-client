import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { BannerComponent } from "../../shared/ui/banner/banner.component";
import { CategoriesSectionComponent } from "../../shared/ui/categories-section/categories-section.component";
import { MatIconModule } from '@angular/material/icon';
import { Colors } from '../../constants/index.constants';
import { ButtonComponent } from "../../shared/ui/buttons/button/button.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BannerComponent, CategoriesSectionComponent, MatIconModule, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  _dataService = inject(DataService);
  toast = inject(HotToastService);
  colors = Colors;

  ngOnInit(): void {
    if(this._dataService.controller.banners) return;

    this._dataService.isLoading.set(true);
    this._dataService.loadBanners().subscribe({
      next: (response) => {
        console.log(response);
        this._dataService.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this._dataService.isLoading.set(false);
        this._dataService.controller = {...this._dataService.controller, banners: true};
        this.toast.error(error.error.message);
      }
    })
  }
}
