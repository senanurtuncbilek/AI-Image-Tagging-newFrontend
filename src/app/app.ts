import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent implements OnInit {
  selectedFile: File | null = null;
  result: any = null;
  userToken: string = '';
  isLoggedIn: boolean = false;
  loginData = { username: '', password: '' };

  isLoggingIn: boolean = false;
  isUploading: boolean = false;
  isCheckingAuth: boolean = false;

  currentUser: { username: string } | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('ngOnInit çalıştı');
    const token = localStorage.getItem('token'); // token varsa otomatik giriş

    if (token) {
      console.log('Token bulundu, otomatik giriş yapılıyor...');
      this.userToken = token;
      this.isLoggedIn = true;
      this.checkAuth();
    } else {
      console.log('Token yok, login ekranı gösteriliyor');
    }
  }

  //  Token geçerliliğini arka planda kontrol et
  checkAuth() {
    if (this.isCheckingAuth) return;
    this.isCheckingAuth = true;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.userToken}`,
    });

    this.http
      .get<{ success: boolean; user: { username: string } }>('http://localhost:3000/api/auth/me', {
        headers,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.currentUser = res.user;
            this.isLoggedIn = true;
            console.log('✅ Oturum doğrulandı:', res.user.username);
          } else {
            this.logout();
          }
          this.isCheckingAuth = false;
          this.cdr.detectChanges(); // Arayüzü güncellemeye zorla
        },
        error: (err) => {
          console.log('❌ Oturum geçersiz veya sunucu kapalı:', err);
          this.isCheckingAuth = false;
          this.logout();
        },
      });
  }

  onLogin() {
    if (this.isLoggingIn) return;

    if (!this.loginData.username || !this.loginData.password) {
      alert('Kullanıcı adı ve şifre gerekli!');
      return;
    }

    console.log('📤 Login isteği gönderiliyor...');
    this.isLoggingIn = true;

    this.http
      .post<{ success: boolean; token: string }>(
        'http://localhost:3000/api/auth/login',
        this.loginData
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            console.log('✅ Giriş başarılı');
            this.userToken = res.token;
            localStorage.setItem('token', res.token);

            // Bug Fix: Arayüzün "Giriş yapılıyor"da takılmasını önlemek için
            // isLoggedIn'i hemen true yapıp loading'i kapatıyoruz.
            this.isLoggedIn = true;
            this.isLoggingIn = false;

            this.getUserInfo(); // Kullanıcı adını çekmek için
          } else {
            this.isLoggingIn = false;
            alert('Giriş başarısız!');
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Login Hatası:', err);
          alert('Kullanıcı adı veya şifre hatalı!');
          this.isLoggingIn = false;
          this.cdr.detectChanges();
        },
      });
  }

  getUserInfo() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.userToken}`,
    });

    this.http
      .get<{ success: boolean; user: { username: string } }>('http://localhost:3000/api/auth/me', {
        headers,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.currentUser = res.user;
            this.loginData.password = ''; // Güvenlik için temizle
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Kullanıcı bilgisi alınamadı:', err);
          if (this.isLoggedIn) this.logout();
        },
      });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (!this.selectedFile || this.isUploading) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.userToken}`,
    });

    this.http.post('http://localhost:3000/api/analyze', formData, { headers }).subscribe({
      next: (res) => {
        this.result = res;
        this.isUploading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Analiz Hatası:', err);
        this.isUploading = false;
        if (err.status === 401) this.logout();
        this.cdr.detectChanges();
      },
    });
  }

  logout() {
    console.log('👋 Oturum kapatılıyor...');
    this.isLoggedIn = false;
    this.userToken = '';
    this.result = null;
    this.selectedFile = null;
    this.currentUser = null;
    this.loginData = { username: '', password: '' };
    localStorage.removeItem('token');
    this.cdr.detectChanges();
  }
}
