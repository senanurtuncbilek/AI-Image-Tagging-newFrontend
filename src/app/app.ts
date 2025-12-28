import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  selectedFile: File | null = null;
  result: any = null;
  userToken: string = ''; // Node.js'den gelen JWT
  isLoggedIn: boolean = false; 
  loginData = { username: '', password: '' }; 

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Giriş Yap ve Proxy'den JWT Al
  onLogin() {
    this.http.post('http://localhost:3000/api/auth/login', this.loginData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.userToken = res.token; 
          this.isLoggedIn = true;
          alert('Giriş başarılı! Analiz paneli açıldı.');
        }
      },
      error: (err) => {
        console.error('Login Hatası:', err);
        alert('Kullanıcı adı veya şifre hatalı!');
      }
    });
  }

  // JWT ile Proxy Üzerinden Analiz İsteği At
  onUpload() {
    if (!this.selectedFile) {
      alert("Lütfen bir dosya seçin!");
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    //Token'ı header'a ekliyoruz
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    this.http.post('http://localhost:3000/api/analyze', formData, { headers }).subscribe({
      next: (res) => {
        this.result = res;
        console.log('Analiz verisi başarıyla alındı!');
      },
      error: (err) => {
        console.error('Analiz Hatası:', err);
        alert('Oturum süresi dolmuş veya yetkisiz erişim!');
      }
    });
  }

  logout() {
    this.isLoggedIn = false;
    this.userToken = '';
    this.result = null;
    this.loginData = { username: '', password: '' };
  }
}