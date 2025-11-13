import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { WordSet } from '../../model/wordset.model';
import { WordsetService } from '../../services/wordset.service';
import { UserService } from '../../services/user.service';
import { HeaderComponent } from '../header/header.component';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { WordSetDetailPopupComponent } from '../word-set-detail-popup/word-set-detail-popup.component';

@Component({
  selector: 'app-wordset-search',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SideBarComponent, WordSetDetailPopupComponent],
  templateUrl: './wordset-search.component.html',
  styleUrls: ['./wordset-search.component.css']
})
export class WordsetSearchComponent implements OnInit {
  //#region Từ khóa tìm kiếm và tiêu đề
  searchKeyword: string = '';
  title: string = 'Results';
  //#endregion

  //#region Dữ liệu bộ từ vựng
  allWordSets: WordSet[] = [];
  filteredVocabSets: WordSet[] = [];
  visibleVocabSets: WordSet[] = [];
  visibleCount = 9;
  //#endregion

  //#region Tương tác yêu thích và dropdown
  activeDropdownIndex: number | null = null;
  userId: number | null = null;
  savedWordSetIds: number[] = [];
  //#endregion

  constructor(
    private wordsetService: WordsetService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchKeyword = (params['q'] || '').trim().toLowerCase();
      console.log("🔍 Keyword:", this.searchKeyword);
  
      // Lấy thông tin user
      this.userService.getCurrentUser().subscribe(user => {
        console.log("🔍 User:", user);
  
        if (user.isLoggedIn && user.user_id) {
          this.userId = user.user_id;
  
          // Lấy danh sách bộ từ yêu thích trước
          this.wordsetService.getFavouriteWordSets(this.userId).subscribe(ids => {
            this.savedWordSetIds = ids.map(set => +set.word_set_id!); // Ép về number
            console.log("✅ Saved IDs:", this.savedWordSetIds);
  
            // Gọi load sau khi đã có dữ liệu
            this.loadWordSets();
          });
  
        } else {
          // Trường hợp chưa đăng nhập vẫn cho phép tìm kiếm
          this.loadWordSets();
        }
      });
    });
  }
  

  //#region Lấy và lọc bộ từ vựng
  loadWordSets(): void {
    this.wordsetService.getAllWordSets().subscribe(sets => {
      this.allWordSets = sets;
      this.filterVisibleSets();
    });
  }

  filterVisibleSets(): void {
    const keyword = this.searchKeyword?.trim().toLowerCase();

    if (!keyword) {
      this.filteredVocabSets = [];
    } else {
      this.filteredVocabSets = this.allWordSets.filter(set =>
        (set.title || '').toLowerCase().includes(keyword) ||
        (set.username || '').toLowerCase().includes(keyword) ||
        (set.tags || []).some(tag => (tag || '').toLowerCase().includes(keyword))
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
