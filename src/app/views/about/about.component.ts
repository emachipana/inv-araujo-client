import { Component } from '@angular/core';
import { BannerInfoComponent } from "../../shared/ui/banner-info/banner-info.component";
import { CardComponent } from "./card/card.component";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [BannerInfoComponent, CardComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
