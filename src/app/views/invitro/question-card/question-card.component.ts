import { Component, Input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './question-card.component.html',
  styleUrl: './question-card.component.scss'
})
export class QuestionCardComponent {
  @Input({required: true}) text!: string;
}
