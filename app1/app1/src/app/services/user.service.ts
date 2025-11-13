import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../model/user.model';

export interface ApiResponse {
  success: boolean;
  message: string;
  user_id?: number;
  user_type?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  //#region 1. Lấy thông tin người dùng theo ID
  getUserById(userId: number): Observable<User> {
    return this.http.get<any>(`${this.baseUrl}/get_user.php?user_id=${userId}`).pipe(
      map(res => new User(res))
    );
  }
  //#endregion

  //#region 2. Tạo người dùng mới
  createUser(user: User): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('password', user.password);
    formData.append('email', user.email);
    if (user.full_name) formData.append('full_name', user.full_name);
    if (user.phone_number) formData.append('phone_number', user.phone_number);
    if (user.description) formData.append('description', user.description);
    if (user.birthdate) formData.append('birthdate', user.birthdate);
    return this.http.post<ApiResponse>(`${this.baseUrl}/create_user.php`, formData);
  }
  
  //#endregion


  //#region 4.Đăng nhập
  login(username: string, password: string): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post<ApiResponse>(
      `${this.baseUrl}/login.php`,
      formData,
      { withCredentials: true } // 👈 THÊM DÒNG NÀY
    );
  }
  //#endregion


  //#region 5. Lấy thông tin người dùng hiện tại
  getCurrentUser(): Observable<{
    isLoggedIn: boolean;
    user_id?: number;
    username?: string;
    user_type?: number;
  }> {
    return this.http.get<{
      isLoggedIn: boolean;
      user_id?: number;
      username?: string;
      user_type?: number;
    }>(`${this.baseUrl}/get_current_user.php`, {
      withCredentials: true
    });
  }  
  
  //#endregion

  //#region 6. Đăng xuất
  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/logout.php`, { 
      withCredentials: true 
    });
  }
  //#endregion

}
