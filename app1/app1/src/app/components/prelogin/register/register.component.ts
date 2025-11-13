import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiResponse, UserService } from '../../../services/user.service';
import { User } from '../../../model/user.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  //#region ⛳️ Biến dữ liệu form
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  //#endregion

  //#region ❗ Biến lỗi
  errorUsername: string = '';
  errorEmail: string = '';
  errorPassword: string = '';
  errorConfirm: string = '';
  //#endregion

  //#region 🔔 Thông báo trạng thái
  notification = {
    show: false,
    message: '',
    isError: false
  };
  //#endregion

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  //#region ✅ Kiểm tra form
  validateForm(): boolean {
    this.errorUsername = '';
    this.errorEmail = '';
    this.errorPassword = '';
    this.errorConfirm = '';

    // Username
    if (this.username.length < 3) {
      this.errorUsername = 'Username must be at least 3 characters';
    } else if (this.username.length > 20) {
      this.errorUsername = 'Username must not exceed 20 characters';
    }

    // Email
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.email)) {
      this.errorEmail = 'Please enter a valid email address';
    }

    // Password
        // Validate mật khẩu
    if (this.password.length < 6 || !/[A-Z]/.test(this.password) || !/[0-9]/.test(this.password)) {
      this.errorPassword = "Password must be at least 6 characters, 1 uppercase letter, and 1 number.";
    }

    // Confirm Password
    if (this.password !== this.confirmPassword) {
      this.errorConfirm = 'Passwords do not match';
    }

    return !(this.errorUsername || this.errorEmail || this.errorPassword || this.errorConfirm);
  }
  //#endregion

  //#region 🧩 Đăng ký tài khoản
  onRegister() {
    if (this.isSubmitting) return;

    if (!this.validateForm()) return;

    this.isSubmitting = true;

    const newUser = new User({
      username: this.username,
      password: this.password,
      email: this.email
    });

    this.userService.createUser(newUser).subscribe({
      next: (res: ApiResponse) => {
        this.showNotification(res.message, !res.success);
        if (res.success) {
          this.username = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
          setTimeout(() => this.router.navigate(['/login']), 3000);
        }
      },
      error: (err) => {
        const message = err?.error?.message ?? 'Could not connect to server.';
        this.showNotification(message, true);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
  //#endregion

  //#region 🔔 Hiển thị thông báo
  private showNotification(message: string, isError: boolean) {
    this.notification = { show: true, message, isError };
    setTimeout(() => this.notification.show = false, 3000);
  }
  //#endregion
}
