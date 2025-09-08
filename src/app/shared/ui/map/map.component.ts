import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import * as L from 'leaflet';
import { Warehouse } from '../../models/Warehouse';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  @Input() warehouse!: Warehouse;
  @ViewChild('map') mapContainer!: ElementRef<HTMLDivElement>;
  private map: any;
  private marker: any;

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    if (!this.warehouse?.latitude || !this.warehouse?.longitude) return;

    this.map = L.map(this.mapContainer.nativeElement).setView(
      [this.warehouse.latitude, this.warehouse.longitude], 
      15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    this.marker = L.marker(
      [this.warehouse.latitude, this.warehouse.longitude],
      { icon: customIcon }
    )
      .addTo(this.map)
      .bindPopup(this.warehouse.name || 'Ubicación de recogida');
  }
}
