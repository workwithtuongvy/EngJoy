import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-headergame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './headergame.component.html',
  styleUrls: ['./headergame.component.css']
})
export class HeadergameComponent {
  @Input() isDarkMode: boolean = true;           // Nhận chế độ theme từ cha
  @Input() formattedTime: string = '00:00';       // Nhận thời gian từ cha
  @Input() gameIconPath: string = '';
  @Input() wordSetTitle: string = '';
  @Input() modeName: string = '';
  @Output() themeToggle = new EventEmitter<void>();
  @Output() restartGame = new EventEmitter<void>();  
  @Output() pauseGame = new EventEmitter<void>();

  onRestartClick(): void {
    this.restartGame.emit();
  }

  onPauseClick(): void {
    this.pauseGame.emit();
  }

  onToggleTheme(): void {
    this.themeToggle.emit();
  }
}
