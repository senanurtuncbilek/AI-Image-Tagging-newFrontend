import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // HttpClient eklendi

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // HttpClientModule buraya eklenmeli
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  selectedFile: File | null = null;
  result: any = null;

  constructor(private http: HttpClient) {} // Servis enjekte edildi

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

onUpload() {
  if (!this.selectedFile) return;

  const formData = new FormData();
  formData.append('image', this.selectedFile); // Python tarafı 'image' ismini bekliyor olabilir

  // DİKKAT: Port 3000'den 5000'e çektik ve yolu kısalttık
  this.http.post('http://localhost:5000/process', formData).subscribe({
    next: (res) => {
      this.result = res;
      console.log('Doğrudan Python bağlantısı başarılı!');
    },
    error: (err) => {
      console.error('Bağlantı Hatası:', err);
      alert('Python sunucusuna ulaşılamadı! Port 5000 açık mı?');
    }
  });
}
}