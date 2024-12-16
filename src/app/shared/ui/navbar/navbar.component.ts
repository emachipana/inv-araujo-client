import { Component } from '@angular/core';
import { InfoComponent } from './info/info.component';
import { MainComponent } from "./main/main.component";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [InfoComponent, MainComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

}
