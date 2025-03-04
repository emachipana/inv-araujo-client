import { Component, inject } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { NgStyle } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { DomSanitizer } from '@angular/platform-browser';
import { Colors } from '../../../constants/index.constants';
import { Image } from '../../models/Image';
import { ButtonComponent } from "../buttons/button/button.component";

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [NgStyle, CarouselModule, ButtonComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  _dataService = inject(DataService);
  sanitizer = inject(DomSanitizer);

  highlightMarkedWord(title: string, markedWord: string) {
    if (!title || !markedWord) return title;
    const result = title.replaceAll(new RegExp(markedWord, 'gi'), `<span style="color: ${Colors.persian}">${markedWord}</span>`);

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }

  mainProductImg(image: Image): string {
    if(!image) return "default_product.png";

    return image.url;
  }
}
