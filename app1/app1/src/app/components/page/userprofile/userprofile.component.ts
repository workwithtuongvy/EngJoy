import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { SideBarComponent } from '../../side-bar/side-bar.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-signup',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SideBarComponent, FormsModule],
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements OnInit {
  userData: any = {};
  tempUserData: any = {};
  Editable: boolean = false;
  showChangePassword: boolean = false;

  oldPassword: string = '';
  newPassword: string = '';
  rePassword: string = '';

  errorUsername: string = '';
  errorEmail: string = '';
  errorOldPassword: string = '';
  errorPassword: string = '';
  errorConfirmPassword: string = '';

  notification = {
    show: false,
    message: '',
    isError: false
  };

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(sessionData => {
      if (sessionData?.isLoggedIn && sessionData.user_id) {
        const userId = sessionData.user_id;
        this.http.get(`${environment.apiUrl}/user/get_profileuser.php?user_id=${userId}`)
          .subscribe((data: any) => {
            if (data && data.success) {
              this.userData = data;
              this.tempUserData = { ...this.userData };
            } else {
              this.showNotification(data.message || "Không thể tải thông tin người dùng", true);
            }
          });
      }
    });
  }

  Editprofile() {
    this.Editable = true;
    this.tempUserData = { ...this.userData };
  }

  ChangePassword() {
    this.showChangePassword = true;
    this.oldPassword = '';
  }

  cancelEdit() {
    this.Editable = false;
    this.showChangePassword = false;
    this.oldPassword = '';
    this.newPassword = '';
    this.rePassword = '';
    this.clearErrors();
    this.tempUserData = { ...this.userData };
  }

  saveProfile() {
    if (!this.validateForm()) return;

    const formData = new FormData();
    formData.append('user_id', this.tempUserData.user_id);
    formData.append('username', this.tempUserData.username);
    formData.append('full_name', this.tempUserData.full_name);
    formData.append('email', this.tempUserData.email);
    formData.append('birthdate', this.tempUserData.birthdate);
    formData.append('description', this.tempUserData.description);

    if (this.showChangePassword) {
      formData.append('old_password', this.oldPassword);
      formData.append('new_password', this.newPassword);
      formData.append('re_password', this.rePassword);
    }

    this.http.post(`${environment.apiUrl}/user/updateprofile.php`, formData)
      .subscribe((res: any) => {
        if (!res.success && res.message.includes('Mật khẩu cũ không đúng')) {
          this.errorOldPassword = res.message;
        } else {
          this.showNotification(res.message, !res.success);
          if (res.success) {
            this.userData = { ...this.tempUserData };
            this.Editable = false;
            this.showChangePassword = false;
            this.clearErrors();
          }
        }
      });
  }

  clearErrors() {
    this.errorUsername = '';
    this.errorEmail = '';
    this.errorPassword = '';
    this.errorConfirmPassword = '';
    this.errorOldPassword = '';
  }

  // ✅ Từng validate khi blur
  validateUsername() {
    this.errorUsername = (!this.tempUserData.username || this.tempUserData.username.length < 3)
      ? 'Username phải có ít nhất 3 ký tự'
      : '';
  }

  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.errorEmail = (!this.tempUserData.email || !emailRegex.test(this.tempUserData.email))
      ? 'Email không hợp lệ'
      : '';
  }

  validateOldPassword() {
    this.errorOldPassword = this.oldPassword ? '' : 'Vui lòng nhập mật khẩu cũ';
  }

  validateNewPassword() {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    this.errorPassword = !passwordRegex.test(this.newPassword)
      ? 'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt'
      : '';
  }

  validateConfirmPassword() {
    this.errorConfirmPassword = this.newPassword !== this.rePassword
      ? 'Mật khẩu nhập lại không khớp'
      : '';
  }

  validateForm(): boolean {
    this.validateUsername();
    this.validateEmail();
    if (this.showChangePassword) {
      this.validateOldPassword();
      this.validateNewPassword();
      this.validateConfirmPassword();
    }

    return !(
      this.errorUsername ||
      this.errorEmail ||
      this.errorOldPassword ||
      this.errorPassword ||
      this.errorConfirmPassword
    );
  }

  private showNotification(message: string, isError: boolean) {
    this.notification = { show: true, message, isError };
    setTimeout(() => this.notification.show = false, 3000);
  }
}
