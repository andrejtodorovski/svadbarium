import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-load-error',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './load-error.component.html',
  styleUrl: './load-error.component.scss',
})
export class LoadErrorComponent {
  @Input() message = 'Настана грешка при вчитување. Проверете ја интернет врската и обидете се повторно.';
  @Output() retry = new EventEmitter<void>();
}
