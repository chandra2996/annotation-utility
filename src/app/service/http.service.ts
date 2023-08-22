import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  postData(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Optional: You can also append additional data to the request
    formData.append('extractCoordinates', 'true');
    formData.append('extractType', '3');

    // Define headers (optional)
    const headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin',  '*');
    const url = 'http://localhost:8088/extractionservice/api/v1/extractFile'; // Replace with your API endpoint
    return this.http.post(url, formData, { headers });
  }
}
