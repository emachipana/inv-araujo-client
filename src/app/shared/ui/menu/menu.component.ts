import { NgStyle } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  @Input() position: 'right' | 'left' = 'left';
  @Output() onHide = new EventEmitter<void>();
  private elementRef = inject(ElementRef);
  isVisible = false;

  show = () => this.isVisible = true;
  hide = () => this.isVisible = false;
  toggle = () => this.isVisible = !this.isVisible;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.hide();
      this.onHide.emit();
    }
  }

  getMenuPosition(): object {
    return this.position === "right" ? {right: "-20px"} : {left: "-20px"};
  }
}
