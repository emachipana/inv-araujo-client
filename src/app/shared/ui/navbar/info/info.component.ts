import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'info',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  _dataService = inject(DataService);
}
