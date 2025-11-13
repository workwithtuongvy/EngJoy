import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  @Input() wordSetId!: number;
  @Input() wordSetTitle!: string;
  @Output() closed = new EventEmitter<void>();

  reportOptions: string[] = [
    'Violation of community rules',
    'Intentional harassment',
    'False definitions',
    'Political intentions',
    'Swear words'
  ];
  selectedReportOption: string | null = null;
  showSuccess = false;

  selectReportOption(option: string) {
    this.selectedReportOption = option;
  }

  close() {
    this.closed.emit();
    this.selectedReportOption = null;
    this.showSuccess = false;
  }

  submitReport() {
    if (!this.selectedReportOption || !this.wordSetId) {
      alert("Please select a reason before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append('word_set_id', this.wordSetId.toString());
    formData.append('reason', this.selectedReportOption);

    // ✅ Log dữ liệu trước khi gửi
    console.log("🔗 Submitting to:", `${environment.apiUrl}/submit_report.php`);
    console.log("📦 Payload:", {
      word_set_id: this.wordSetId,
      reason: this.selectedReportOption
    });

    // ✅ Gửi form không set headers thủ công
    fetch(`${environment.apiUrl}/submit_report.php`, {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📥 Server response:", data);
        if (data.success) {
          this.showSuccess = true;
          setTimeout(() => this.close(), 2000);
        } else {
          alert(data.message || 'Failed to report.');
        }
      })
      .catch(err => {
        console.error('❌ Fetch error:', err);
        alert('Server error: ' + err.message);
      });
  }
}
