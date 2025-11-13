import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { SideBarComponent } from '../../side-bar/side-bar.component';
import { WordsetService } from '../../../services/wordset.service';
import { UserService } from '../../../services/user.service';
import { RouterModule } from '@angular/router';
import { WordSet } from '../../../model/wordset.model';
import { FooterComponent } from '../../footer/footer.component';
import { TagService, Tag } from '../../../services/tag.service';
import { catchError, map, of } from 'rxjs';
import { WordSetDetailPopupComponent } from '../../word-set-detail-popup/word-set-detail-popup.component';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SideBarComponent, WordSetDetailPopupComponent],
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {
  //#region Bộ từ
  allVocabSets: WordSet[] = [];
  filteredVocabSets: WordSet[] = [];
  visibleVocabSets: WordSet[] = [];
  visibleCount = 9;
  //#endregion

  //#region Tag
  tags: Tag[] = [];
  activeTagIndices: boolean[] = [];
  colorPalette: string[] = [
    '#E0E0E0', '#D0B3FF', '#FFB3B3', '#B3D9FF', '#FFD699',
    '#B3FFCC', '#FF99CC', '#A3E4D7', '#FAD7A0', '#F5CBA7'
  ];
  showAllTags: boolean = false;
  //#endregion

  //#region Yêu thích, dropdown
  userId: number | null = null;
  savedWordSetIds: number[] = [];
  activeDropdownIndex: number | null = null;
  //#endregion

  constructor(
    private wordsetService: WordsetService,
    private userService: UserService,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    // 1. Lấy danh sách tag
    this.tagService.getAllTags().subscribe(res => {
      if (res.success) {
        this.tags = res.tags.sort((a, b) => b.usage_count - a.usage_count);
        this.activeTagIndices = Array(this.tags.length).fill(false);
      } else {
        console.warn("❌ Không lấy được tag:", res.message);
      }
    });
  
    // 2. Lấy user → lấy saved → rồi mới lấy word sets
    this.userService.getCurrentUser().subscribe(user => {
      if (user.isLoggedIn && user.user_id) {
        this.userId = user.user_id;
  
        this.wordsetService.getFavouriteWordSets(this.userId).subscribe(ids => {
          this.savedWordSetIds = ids.map(set => +set.word_set_id!); // ✅ ép về number
          console.log("✅ Saved IDs đã có:", this.savedWordSetIds);
  
          // Tiếp tục: lấy tất cả wordsets
          this.wordsetService.getAllWordSets().subscribe(sets => {
            this.allVocabSets = sets;
            this.filterVisibleSets(); // sẽ dùng được isSaved()
          });
        });
  
      }
    });
  }
  

  //#region Tag interaction
  toggleTag(index: number): void {
    this.activeTagIndices[index] = !this.activeTagIndices[index];
    this.filterVisibleSets();
  }


  getTagColor(index: number, isActive: boolean): string {
    const baseColor = this.colorPalette[index % this.colorPalette.length];
    return isActive ? baseColor : baseColor + 'B3';
  }

  toggleShowAllTags(): void {
    this.showAllTags = !this.showAllTags;
  }

  get visibleTags(): Tag[] {
    return this.showAllTags ? this.tags : this.tags.slice(0, 18);
  }
  //#endregion

  //#region Lọc và hiển thị bộ từ
  filterVisibleSets(): void {
    const selectedTagNames = this.tags
      .filter((_, i) => this.activeTagIndices[i])
      .map(tag => tag.tag_name);

    if (selectedTagNames.length === 0) {
      this.filteredVocabSets = [...this.allVocabSets];
    } else {
      this.filteredVocabSets = this.allVocabSets.filter(set =>
        selectedTagNames.every(tag =>
          set.tags?.includes(tag)
        )
      );
    }

    this.visibleVocabSets = this.filteredVocabSets.slice(0, this.visibleCount);
  }

  showMore(): void {
    this.visibleCount += 3;
    this.visibleVocabSets = this.filteredVocabSets.slice(0, this.visibleCount);
  }
  //#endregion

  
  //#region dropdown
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;

  toggleDropdown(i: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation(); // ✅ Ngăn HostListener xử lý cùng lúc
    }
  
    this.activeDropdownIndex = this.activeDropdownIndex === i ? null : i;
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const clickedInsideAny = this.dropdownRefs?.some(ref =>
      ref.nativeElement.contains(target)
    );

    // Nếu không click vào dropdown hoặc nút Game On → đóng dropdown
    if (!clickedInsideAny) {
      this.activeDropdownIndex = null;
    }
  }

  //#endregion

  //#region yêu thích bộ từ
  isSaved(wordSetId: number): boolean {
    return this.savedWordSetIds.includes(wordSetId);
  }

  toggleFavorite(index: number): void {
    const wordSetId = this.visibleVocabSets[index].word_set_id!;
    
    if (!this.userId) {
      console.warn("Chưa có userId – không thể thực hiện thao tác yêu thích");
      return;
    }
  
    if (this.isSaved(wordSetId)) {
      // ✅ UNSAVE
      this.wordsetService.removeFavouriteSet(this.userId, wordSetId).subscribe(res => {
        if (res.success) {
          this.savedWordSetIds = this.savedWordSetIds.filter(id => id !== wordSetId);
          console.log("✅ Đã xóa khỏi danh sách yêu thích:", wordSetId);
        } else {
          console.warn("❌ Xóa yêu thích thất bại:", res.message);
        }
      });
    } else {
      // ✅ SAVE
      this.wordsetService.saveWordSet(wordSetId, this.userId).subscribe(res => {
        if (res.success) {
          this.savedWordSetIds = [...this.savedWordSetIds, wordSetId];
          console.log("✅ Đã thêm vào danh sách yêu thích:", wordSetId);
        } else {
          console.warn("❌ Thêm yêu thích thất bại:", res.message);
        }
      });
    }
  }
  //#endregion
  //#region hiển thị chi tiết bộ từ
  selectedWordSetId: number | null = null;
  openPopup(wordSetId: number): void {
    console.log("🔍 WordSet ID:", wordSetId);
    this.selectedWordSetId = wordSetId;

  }
  onPopupClosed(): void {
    // ✅ Reset sau 100ms để chắc chắn Angular không destroy quá sớm
    setTimeout(() => {
      this.selectedWordSetId = null;
    }, 100);
  }
  //#endregion

}
