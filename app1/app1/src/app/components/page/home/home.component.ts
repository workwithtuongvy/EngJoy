import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { SideBarComponent } from '../../side-bar/side-bar.component';
import { WordsetService } from '../../../services/wordset.service';
import { UserService } from '../../../services/user.service';
import { RouterModule, Router } from '@angular/router';
import { WordSet } from '../../../model/wordset.model';
import { WordSetDetailPopupComponent } from '../../word-set-detail-popup/word-set-detail-popup.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SideBarComponent, WordSetDetailPopupComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  //#region Bộ từ
  allVocabSets: WordSet[] = [];
  visibleVocabSets: WordSet[] = [];
  visibleCount = 9;
  //#endregion

  //#region Dropdown & Favorite
  activeDropdownIndex: number | null = null;
  userId: number | null = null;
  savedWordSetIds: number[] = [];
  //#endregion

  constructor(
    private wordsetService: WordsetService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      console.log("🔍 User:", user);
  
      if (user.isLoggedIn && user.user_id) {
        this.userId = user.user_id;
  
        // 1. Lấy danh sách bộ từ đã lưu
        this.wordsetService.getFavouriteWordSets(this.userId).subscribe(ids => {
          this.savedWordSetIds = ids.map(set => +set.word_set_id!);  // ✅ Ép về number
          console.log("✅ Saved IDs đã có:", this.savedWordSetIds);
  
          // 2. Sau khi có saved IDs → lấy tất cả bộ từ
          this.wordsetService.getAllWordSets().subscribe({
            next: (sets) => {
              this.allVocabSets = sets;
              this.updateVisibleSets(); // lúc này isSaved sẽ hoạt động chính xác
            },
            error: (err) => {
              console.error('❌ Lỗi khi tải bộ từ:', err);
              alert('Không thể tải dữ liệu từ server.');
            }
          });
        });
  
      } 
    });
  }
  
  //#region hiển thị bộ từ
  updateVisibleSets() {
    this.visibleVocabSets = this.allVocabSets.slice(0, this.visibleCount);
  }

  showMore() {
    this.visibleCount += 3;
    this.updateVisibleSets();
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
