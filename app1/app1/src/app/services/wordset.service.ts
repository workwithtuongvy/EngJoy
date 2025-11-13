import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { WordSet } from '../model/wordset.model';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';

export interface ApiResponse {
  success: boolean;
  message: string;
  word_set_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WordsetService {
  private baseUrl = `${environment.apiUrl}/wordset`;

  constructor(private http: HttpClient) {}

  //#region 1. Tạo bộ từ mới
  createWordSet(wordSet: WordSet): Observable<ApiResponse> {
    const formData = new FormData();
    const words = wordSet.words.map(({ term, definition }) => ({ term, definition }));

    formData.append('title', wordSet.title);
    formData.append('user_id', wordSet.user_id.toString());
    formData.append('cards', JSON.stringify(words));
    formData.append('tag_ids', JSON.stringify(wordSet.tag_ids ?? []));

    return this.http.post<ApiResponse>(`${this.baseUrl}/insert_wordset.php`, formData);
  }
  //#endregion

  //#region 2. Lấy bộ từ theo ID
  getWordSetById(wordSetId: number): Observable<WordSet> {
    return this.http.get<any>(`${this.baseUrl}/get_wordset.php?word_set_id=${wordSetId}`).pipe(
      map(res => new WordSet(res)) // ép JSON trả về vào constructor để parse đúng
    );
  }
  //#endregion



  //#region 4. Lấy danh sách bộ từ do user tạo
  getWordSetsByUser(userId: number): Observable<WordSet[]> {
    return this.http.get<WordSet[]>(`${this.baseUrl}/get_by_user.php?user_id=${userId}`);
  }
  //#endregion

  //#region 5. Lấy danh sách bộ từ mà user đã chơi
  getPlayedWordSets(userId: number): Observable<WordSet[]> {
    return this.http.get<WordSet[]>(`${this.baseUrl}/get_played_sets.php?user_id=${userId}`);
  }
  //#endregion

  //#region 6. Cập nhật bộ từ
  updateWordSet(wordSet: WordSet): Observable<ApiResponse> {
    const formData = new FormData();
    const words = wordSet.words.map(({ vocab_id, term, definition }) => ({ vocab_id, term, definition }));

    formData.append('word_set_id', wordSet.word_set_id!.toString());
    formData.append('title', wordSet.title);
    formData.append('user_id', wordSet.user_id.toString());
    formData.append('cards', JSON.stringify(words));
    formData.append('tag_ids', JSON.stringify(wordSet.tag_ids ?? []));

    return this.http.post<ApiResponse>(`${this.baseUrl}/update_wordset.php`, formData);
  }
  //#endregion

  //#region 7. Lấy danh sách bộ từ mà user đã thích
  getFavouriteWordSets(userId: number): Observable<WordSet[]> {
    return this.http.get<WordSet[]>(`${this.baseUrl}/get_favourite_sets.php?user_id=${userId}`);
  }
  //#endregion

  //#region 8. Xóa bộ từ do user tạo
  deleteWordSet(wordSetId: number): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('word_set_id', wordSetId.toString());
    return this.http.post<ApiResponse>(`${this.baseUrl}/delete_wordset.php`, formData);
  }
  //#endregion

  //#region 9. Xóa bộ từ khỏi danh sách yêu thích
  removeFavouriteSet(userId: number, wordSetId: number): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('user_id', userId.toString());
    formData.append('word_set_id', wordSetId.toString());
      return this.http.post<ApiResponse>(`${this.baseUrl}/remove_favourite.php`, formData);
  }
  //#endregion

  //#region 10. Xóa bộ từ khỏi danh sách đã học
  removePlayedSet(userId: number, wordSetId: number): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('user_id', userId.toString());
  formData.append('word_set_id', wordSetId.toString());
  return this.http.post<ApiResponse>(`${this.baseUrl}/remove_played.php`, formData);
  }
  //#endregion

  //#region 11. Lấy danh sách tất cả bộ từ công khai (is_hidden = 2)
  getAllWordSets(): Observable<any[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/get_all_sets.php`).pipe(
      map(res => res.success ? res.data : []),
      catchError(err => {
        console.error("❌ API get_all_sets lỗi:", err);
        return of([]);
      })
    );
  }
  //#endregion

  //#region 12. Lưu bộ từ vào danh sách yêu thích (SavedWordSet)
  saveWordSet(word_set_id: number, user_saved_id: number): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('word_set_id', word_set_id.toString());
    formData.append('user_saved_id', user_saved_id.toString());

    return this.http.post<ApiResponse>(`${this.baseUrl}/save_wordset.php`, formData);
  }
  //#endregion



  

}
