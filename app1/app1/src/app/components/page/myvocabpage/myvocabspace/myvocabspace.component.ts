// myvocabspace.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../header/header.component';
import { SideBarComponent } from '../../../side-bar/side-bar.component';
import { RouterModule } from '@angular/router';
import { WordSet } from '../../../../model/wordset.model';
import { WordsetService } from '../../../../services/wordset.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-myvocabspace',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SideBarComponent, RouterModule],
  templateUrl: './myvocabspace.component.html',
  styleUrl: './myvocabspace.component.css'
})
export class MyVocabSpaceComponent implements OnInit {
  allWordSets: WordSet[] = [];
  filteredWordSets: WordSet[] = [];
  displayedWordSets: WordSet[] = [];
  selectedFilter: string = 'created';
  userId: number = 0;
  isLoaded: boolean = false;
  itemsToShow: number = 5;
  dropdownOpen: boolean = false;
  activeDropdownIndex: number | null = null;
  searchQuery: string = '';

  constructor(
    private wordsetService: WordsetService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(res => {
      if (res.isLoggedIn && res.user_id) {
        this.userId = res.user_id;
        this.loadWordSets();
      }
    });
  }

  loadWordSets(): void {
    this.isLoaded = false;
    this.allWordSets = [];
    this.filteredWordSets = [];
    this.displayedWordSets = [];
  
    let source$ = this.wordsetService.getWordSetsByUser(this.userId);
    if (this.selectedFilter === 'studied') {
      source$ = this.wordsetService.getPlayedWordSets(this.userId);
    } else if (this.selectedFilter === 'favourite') {
      source$ = this.wordsetService.getFavouriteWordSets(this.userId);
    }
  
    source$.subscribe(async wordSets => {
      this.allWordSets = wordSets.sort((a, b) =>
        new Date(b.last_update ?? '').getTime() - new Date(a.last_update ?? '').getTime()
      );
  
      // Lấy danh sách user_id duy nhất
      const userIds = [...new Set(this.allWordSets.map(w => w.user_id))];
  
      // Promise lấy danh sách user
      const requests = userIds.map(id =>
        this.userService.getUserById(id).toPromise().catch(() => undefined)
      );
  
      const users = await Promise.all(requests);
  
      // Gán username nếu tìm thấy
      for (const user of users) {
        if (!user) continue;
        this.allWordSets.forEach(w => {
          if (w.user_id === user.user_id) {
            w.username = user.username;
          }
        });
      }
  
      // ✅ Chỉ cập nhật sau khi hoàn tất username
      this.filteredWordSets = [...this.allWordSets];
      this.displayedWordSets = this.filteredWordSets.slice(0, this.itemsToShow);
      this.isLoaded = true;
    });
  }
  
  

  toggleGameDropdown(index: number): void {
    this.activeDropdownIndex = this.activeDropdownIndex === index ? null : index;
  }

  onFilterChange(value: string): void {
    if (this.selectedFilter !== value) {
      this.selectedFilter = value;
      this.loadWordSets();
    }
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredWordSets = this.allWordSets.filter(set =>
      set.title.toLowerCase().includes(query) ||
      set.word_set_id?.toString().includes(query)
    );
    this.displayedWordSets = this.filteredWordSets.slice(0, this.itemsToShow);
  }

  showMore(): void {
    const next = this.displayedWordSets.length + 5;
    this.displayedWordSets = this.filteredWordSets.slice(0, next);
  }

  onUserClick(userId: number): void {
    console.log('User clicked:', userId);
  }

  onDelete(set: WordSet): void {
    let context = '';
  
    switch (this.selectedFilter) {
      case 'created':
        context = 'you created';
        break;
      case 'favourite':
        context = 'your favorites';
        break;
      case 'studied':
        context = 'your studied sets';
        break;
    }
  
    const confirmMsg = `Are you sure you want to delete the word set "${set.title}" from ${context}?`;
  
    if (confirm(confirmMsg)) {
      if (this.selectedFilter === 'created') {
        this.wordsetService.deleteWordSet(set.word_set_id!).subscribe(res => {
          alert('The word set has been deleted successfully.');
          this.loadWordSets();
        });
      } else if (this.selectedFilter === 'favourite') {
        this.wordsetService.removeFavouriteSet(this.userId, set.word_set_id!).subscribe(res => {
          alert('The word set has been removed from your favorites.');
          this.loadWordSets();
        });
      } else if (this.selectedFilter === 'studied') {
        this.wordsetService.removePlayedSet(this.userId, set.word_set_id!).subscribe(res => {
          alert('The word set has been removed from your studied list.');
          this.loadWordSets();
        });
      }
    }
  }
  

}
