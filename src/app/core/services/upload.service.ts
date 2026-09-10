import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UploadCategory = 'products' | 'families';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private readonly http: HttpClient) {}

  /** Uploads an image and returns its relative URL (e.g. "/uploads/products/xxx.jpg") — store this as-is,
   * it's what keeps a saved record portable across environments. Convert with toAbsoluteUrl() to display it. */
  uploadImage(file: File, category: UploadCategory): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<{ url: string }>(`${environment.apiUrl}/uploads/image?category=${category}`, formData)
      .pipe(map((result) => result.url));
  }

  /** Prefixes a stored relative URL with the API's origin so an <img> can load it directly. */
  toAbsoluteUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('http') ? url : `${environment.filesBaseUrl}${url}`;
  }
}
