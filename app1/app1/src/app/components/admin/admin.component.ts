import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { WordSetDetailPopupComponent } from '../word-set-detail-popup/word-set-detail-popup.component';

interface ReportItem {
  word_set_id: number;
  report_id: number;
  wordset_title: string;
  report_status: number;
  reason: string;
  reported_date: string;
}
interface UpdateTicketResponse {
  success: boolean;
}
interface DashboardMetricsResponse {
  new_player: number;
  avg_play_time: number;
  pending_reports: number;
  total_wordset: number;
  wordset_created_today: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  imports: [CommonModule, RouterModule, WordSetDetailPopupComponent]
})
export class AdminComponent implements OnInit {
  reportList: ReportItem[] = [];
  isDropdownOpen: boolean[] = [];

  metrics: DashboardMetricsResponse = {
    new_player: 0,
    avg_play_time: 0,
    pending_reports: 0,
    total_wordset: 0,
    wordset_created_today: 0,
  };

  constructor(private http: HttpClient, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.getDashboardMetrics();
    this.getReportList();
  }

  get formattedTimeAvgPlaytime(): string {
    const hours = Math.floor(this.metrics.avg_play_time / 3600);
    const minutes = Math.floor((this.metrics.avg_play_time % 3600) / 60);
    const seconds = this.metrics.avg_play_time % 60;

    const parts = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }



  getReportList() {
    this.http.get<ReportItem[]>(`${environment.apiUrl}/admin/get_reported_list.php`)
      .subscribe(data => {
        this.reportList = data;
        this.isDropdownOpen = Array(data.length).fill(false); // init state
      });
  }

  toggleDropdown(index: number) {
    this.isDropdownOpen[index] = !this.isDropdownOpen[index];
  }


  getDashboardMetrics() {
    this.http.get<DashboardMetricsResponse>(`${environment.apiUrl}/admin/get_admin_metrics.php`)
      .subscribe(data => {
        this.metrics = data;
      });
  }

  updateTicket(index: number, status: number) {
    const formData = new FormData();
    formData.append('report_id', this.reportList[index].report_id.toString());
    formData.append('report_status', status.toString());
    formData.append('report_reason', this.reportList[index].reason);

    this.http.post<UpdateTicketResponse>(`${environment.apiUrl}/admin/update_report_status.php`, formData)
      .subscribe(data => {
        if (data.success) {
          this.reportList[index].report_status = status;
        }
      });
  }
  
  onLogout(): void {
    this.userService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

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
