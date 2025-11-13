import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordSet } from '../../model/wordset.model';
import { WordsetService } from '../../services/wordset.service';
import { RouterModule } from '@angular/router';
import { ReportComponent } from '../page/report/report.component';

@Component({
  selector: 'app-word-set-detail-popup',
  templateUrl: './word-set-detail-popup.component.html',
  styleUrls: ['./word-set-detail-popup.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReportComponent]
})
export class WordSetDetailPopupComponent implements OnChanges {

  // Nhận ID của bộ từ cần hiển thị
  @Input() word_set_id: number | null = null;

  // Quyết định có hiện nút Report hay không
  @Input() showReportButton: boolean = false;

  // Báo cho component cha biết popup đã đóng
  @Output() closed = new EventEmitter<void>();

  // Tham chiếu DOM để kiểm tra click ngoài
  @ViewChild('popupRef') popupRef!: ElementRef;

  // Trạng thái hiển thị popup
  isPopupVisible = false;

  // Trạng thái hiển thị modal report
  showReportModal = false;


  // Để bỏ qua click ngoài ngay khi mới mở
  justOpened = false;

  // Dữ liệu bộ từ
  wordsetDetail: WordSet = {
    title: '',
    user_id: 0,
    tag_ids: [],
    words: [],
    tags: []
  };

  constructor(private wordsetService: WordsetService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Khi ID bộ từ thay đổi → gọi API và hiển thị popup
    if (changes['word_set_id'] && this.word_set_id != null) {
      this.fetchWordSet();
      this.isPopupVisible = true;
      this.justOpened = true;
      setTimeout(() => this.justOpened = false, 200);
    }
  }

  // Gọi API lấy dữ liệu bộ từ
  fetchWordSet(): void {
    this.wordsetService.getWordSetById(this.word_set_id!).subscribe({
      next: (res) => this.wordsetDetail = res,
      error: (err) => console.error('❌ Lỗi khi lấy wordset:', err)
    });
  }

  // Đóng popup và thông báo về cha
  closePopup(): void {
    this.isPopupVisible = false;
    this.closed.emit();
  }

  // Nếu click bên ngoài popup → tự đóng
  @HostListener('document:click', ['$event'])
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.justOpened) return;

    const popupEl = this.popupRef?.nativeElement;
    const reportModalEl = document.querySelector('app-report');

    const clickedInsidePopup = popupEl?.contains(event.target as Node);
    const clickedInsideReport = reportModalEl?.contains(event.target as Node);

    if (!clickedInsidePopup && !clickedInsideReport) {
      this.closePopup();
    }
  }

}
