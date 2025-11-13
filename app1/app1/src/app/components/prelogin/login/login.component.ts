import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiResponse, UserService } from '../../../services/user.service';
import { User } from '../../../model/user.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isSubmitting: boolean = false;
  showPassword: boolean = false;

  notification = {
    show: false,
    message: '',
    isError: false
  };

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  onLogin() {
    console.log(this.username, this.password);

    if (this.isSubmitting) return;
  
    if (this.username.trim() === '' || this.password.trim() === '') {
      this.showNotification("Please enter your username and password!", true);
      return;
    }
  
    this.isSubmitting = true;
  
    this.userService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.showNotification(res.message, !res.success);
    
        if (res.success) {
          // Reset form
          this.username = '';
          this.password = '';
        
          // Gọi lại session để lấy user_type chuẩn từ session (không dùng localStorage)
          this.userService.getCurrentUser().subscribe(session => {
            console.log('Session returned:', session);
            if (session.user_type == 2) {
              console.log("admin");
              this.router.navigate(['/admin']); // chuyển admin
            } else {
              this.router.navigate(['/home']);  // chuyển người dùng thường
            }
          });
        }
        
        
      },
      error: () => {
        this.showNotification("Cannot connect to server!", true);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
    
  }
  

  private showNotification(message: string, isError: boolean) {
    this.notification = {
      show: true,
      message: message,
      isError: isError
    };
    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }
}
