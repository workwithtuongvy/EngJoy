import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Định nghĩa interface cho từng tag
export interface Tag {
  tag_id: number;
  tag_name: string;
  usage_count: number; // ✅ thêm usage_count để tương thích API mới
}

// Định nghĩa kiểu phản hồi từ server
interface TagResponse {
  success: boolean;
  message: string;
  tags: Tag[];  // Mỗi tag có id, name và số lần sử dụng
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  constructor(private http: HttpClient) {}

  //#region Lấy danh sách tag từ server
  getAllTags(): Observable<TagResponse> {
    return this.http.get<TagResponse>(`${environment.apiUrl}/tag/get_tags.php`);
  }
  //#endregion
}
