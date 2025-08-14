import { Component, Input } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-banner-info',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './banner-info.component.html',
  styleUrl: './banner-info.component.scss'
})
export class BannerInfoComponent {
  @Input({required: true}) title!: string;
  @Input({required: true}) text!: string;
}
