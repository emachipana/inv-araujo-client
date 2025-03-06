import { Component } from '@angular/core';
import { bootstrapFacebook, bootstrapInstagram, bootstrapWhatsapp, bootstrapTiktok } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIcon],
  viewProviders: [provideIcons({ bootstrapFacebook, bootstrapInstagram, bootstrapWhatsapp, bootstrapTiktok })],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
