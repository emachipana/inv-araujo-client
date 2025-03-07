import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit {
  _dataService = inject(DataService);
  router = inject(Router);
  currentCategory?: string;
  isLoading = false;

  ngOnInit(): void {
    this.currentCategory = this.router.parseUrl(this.router.url).queryParams["category"].toLowerCase();

    // if(this._dataService.products)
  }
}
