import { Component, EventEmitter, Input, Output, OnInit, HostListener } from '@angular/core';
import { WordSet } from '../../model/wordset.model';
import { CommonModule } from '@angular/common'; 
import { WordsetService } from '../../services/wordset.service';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-gridwordset',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gridwordset.component.html',
  styleUrl: './gridwordset.component.css'
})
export class GridwordsetComponent implements OnInit {
  @Input() cards: WordSet[] = [];
  @Input() cardCount: number = 3;

  activeDropdownIndex: number | null = null;
  userId: number | null = null;
  savedWordSetIds: number[] = [];

  constructor(
    private wordsetService: WordsetService,
    private userService: UserService,
    private router: Router
  ) {}

  getDropdownTop(index: number): number {
    const buttons = document.querySelectorAll('.play-button');
    if (buttons[index]) {
      const rect = buttons[index].getBoundingClientRect();
      return rect.bottom + window.scrollY + 5;
    }
    return 0;
  }

  getDropdownLeft(index: number): number {
    const buttons = document.querySelectorAll('.play-button');
    if (buttons[index]) {
      const rect = buttons[index].getBoundingClientRect();
      return rect.left + window.scrollX - 30; // Adjust 30px to center it
    }
    return 0;
  }
  
  goTo(type: string, id: number) {
    this.activeDropdownIndex = null; // Close dropdown after selection
    if (type === 'wordsearchstart') {
      this.router.navigate(['/wordsearchgame', id]);
    } else if (type === 'flipcardstart') {
      this.router.navigate(['/flipcardgame', id]);
    }
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      if (user.isLoggedIn && user.user_id) {
        this.userId = user.user_id;
        this.wordsetService.getFavouriteWordSets(this.userId).subscribe(ids => {
          this.savedWordSetIds = ids.map(set => set.word_set_id!);
        });
      }
    });
  }

  isSaved(wordSetId: number): boolean {
    return this.savedWordSetIds.includes(wordSetId);
  }

  toggleFavorite(index: number) {
    const wordSetId = this.cards[index].word_set_id!;
    if (!this.userId) return;
  
    if (this.isSaved(wordSetId)) {
      this.wordsetService.removeFavouriteSet(wordSetId, this.userId).subscribe(res => {
        if (res.success) {
          this.savedWordSetIds = this.savedWordSetIds.filter(id => id !== wordSetId);
        }
      });
    } else {
      this.wordsetService.saveWordSet(wordSetId, this.userId).subscribe(res => {
        if (res.success) {
          this.savedWordSetIds = [...this.savedWordSetIds, wordSetId];
        }
      });
    }
  }

  toggleDropdown(i: number) {
    if (this.activeDropdownIndex === i) {
      this.activeDropdownIndex = null;
    } else {
      this.activeDropdownIndex = i;
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.game-dropdown') && !target.closest('.play-button')) {
      this.activeDropdownIndex = null;
    }
  }
}
