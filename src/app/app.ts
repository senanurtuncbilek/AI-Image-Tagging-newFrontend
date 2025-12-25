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


  //private readonly TOKEN = '1234567890987654321';

  userToken: string = '';
  
  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (!this.selectedFile) {
      alert("Lütfen bir dosya seçin!");
      return;
    }
    
    if (!this.userToken) {
      alert("Lütfen bir API Token girin!");
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.userToken}`
    });

    this.http.post('http://localhost:5000/process', formData, { headers }).subscribe({
      next: (res) => {
        this.result = res;
        console.log('Güvenli Python bağlantısı başarılı!');
      },
      error: (err) => {
        console.error('Bağlantı Hatası:', err);
        if (err.status === 401) {
          alert('Yetkisiz Erişim: Token hatalı veya eksik!');
        } else {
          alert('Python sunucusuna ulaşılamadı! Port 5000 açık mı?');
        }
      }
    });
  }
}