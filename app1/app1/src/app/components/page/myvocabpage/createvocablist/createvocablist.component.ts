// Các import cần thiết
import { Component, HostListener } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HeaderComponent } from '../../../header/header.component';
import { SideBarComponent } from '../../../side-bar/side-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

import { Word } from '../../../../model/word.model';
import { WordsetService } from '../../../../services/wordset.service';
import { TagService } from '../../../../services/tag.service';
import { WordSet } from '../../../../model/wordset.model';
import { UserService } from '../../../../services/user.service';
@Component({
  selector: 'app-createvocablist',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DragDropModule,
    HeaderComponent, SideBarComponent, HttpClientModule
  ],
  templateUrl: './createvocablist.component.html',
  styleUrls: ['./createvocablist.component.css']
})
export class CreatevocablistComponent {
  //#region Dữ liệu hiển thị
  setTitle = '';
  cards: Word[] = [new Word({ term: '', definition: '' })];
  selectedTags: number[] = [];
  availableTags: { tag_id: number, tag_name: string }[] = [];
  dropdownOpen = false;
  isSubmitting = false;
  isEditMode = false;
  wordSetId?: number;
  userId?: number;
  //#endregion

  //#region Thông báo trạng thái
  notification = {
    show: false,
    message: '',
    isError: false
  };
  showNotification(message: string, isError: boolean) {
    this.notification = { show: true, message, isError };
    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }
  //#endregion

  constructor(
    private wordsetService: WordsetService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.fetchTags();

    const idParam = this.route.snapshot.paramMap.get('word_set_id');
    if (idParam) {
      this.wordSetId = +idParam;
      this.isEditMode = true;
      this.loadWordSet(this.wordSetId);
    }
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.userId = user.user_id;
      }
    });
  }

  //#region Tải dữ liệu
  fetchTags(): void {
    this.tagService.getAllTags().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.tags)) {
          this.availableTags = res.tags.sort((a, b) => a.tag_name.localeCompare(b.tag_name));
        }
      },
      error: () => this.showNotification("Cannot load tag list!", true)
    });
  }

  loadWordSet(id: number): void {
    this.wordsetService.getWordSetById(id).subscribe({
      next: (wordSet) => {
        this.setTitle = wordSet.title;
        this.cards = wordSet.words.map(w => new Word(w));
        this.selectedTags = wordSet.tag_ids ?? [];
      },
      error: () => this.showNotification("Cannot load word set!", true)
    });
  }
  //#endregion

  //#region Xử lý tag
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
  closeDropdown(): void {
    this.dropdownOpen = false;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const inside = target.closest('.position-relative');
    if (!inside) this.closeDropdown();
  }
  onTagToggle(tagId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked && !this.selectedTags.includes(tagId)) {
      this.selectedTags.push(tagId);
    } else if (!checked) {
      this.selectedTags = this.selectedTags.filter(id => id !== tagId);
    }
  }
  getTagNameById(tagId: number): string {
    const tag = this.availableTags.find(t => t.tag_id === tagId);
    return tag ? tag.tag_name : 'Unknown';
  }
  
  removeTag(tagId: number): void {
    this.selectedTags = this.selectedTags.filter(id => id !== tagId);
  }
  
  //#endregion

  //#region Xử lý card
  addCard() {
    this.cards.push(new Word({ term: '', definition: '' }));
  }
  removeCard(index: number) {
    this.cards.splice(index, 1);
  }
  drop(event: CdkDragDrop<Word[]>) {
    moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
  }
  allowOnlyEnglish(event: KeyboardEvent) {
    const char = event.key;
    const isValid = /^[a-zA-Z\s\-]$/.test(char);
    if (!isValid) {
      event.preventDefault();
      this.showNotification("Only allow letters, spaces, and hyphens!", true);
    }
  }
  onPaste(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData('text') || '';
    if (!/^[a-zA-Z\s\-]+$/.test(paste)) {
      event.preventDefault();
      this.showNotification("Only allow letters, spaces, and hyphens!", true);
    }
  }
  //#endregion

  //#region Gửi dữ liệu
  submit(): void {
    if (this.isSubmitting) return;
    const filtered = this.cards.filter(c => c.term.trim() && c.definition.trim());
    if (!this.setTitle.trim()) return this.showNotification("Please enter a title!", true);
    if (filtered.length === 0) return this.showNotification("No word input!", true);
    if (this.selectedTags.length === 0) return this.showNotification("Select at least 1 tag!", true);

    const wordSet = new WordSet({
      word_set_id: this.wordSetId,
      title: this.setTitle,
      user_id: this.userId,
      words: filtered,
      tag_ids: this.selectedTags
    });

    this.isSubmitting = true;
    const request = this.isEditMode
      ? this.wordsetService.updateWordSet(wordSet)
      : this.wordsetService.createWordSet(wordSet);

    request.subscribe({
      next: (res) => {
        this.showNotification(res.message, !res.success);
        if (res.success && !this.isEditMode) {
          this.setTitle = '';
          this.cards = [new Word({ term: '', definition: '' })];
          this.selectedTags = []; 
        }
      },
      error: () => this.showNotification("Cannot submit data!", true),
      complete: () => this.isSubmitting = false
    });
  }
  //#endregion
}
