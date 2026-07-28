import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReorderItem } from '../models/reorder-item.model';

export abstract class ReorderableCrudService<T> {
  protected readonly http = inject(HttpClient);

  protected constructor(
    private readonly listUrl: string,
    protected readonly adminBaseUrl: string,
  ) {}

  list(): Observable<T[]> {
    return this.http.get<T[]>(this.listUrl);
  }

  reorder(items: ReorderItem[]): Observable<void> {
    return this.http.put<void>(`${this.adminBaseUrl}/reorder`, items);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBaseUrl}/${id}`);
  }

  protected uploadFile(file: File, paramName: string, paramValue: string | null): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    let params = new HttpParams();
    if (paramValue) {
      params = params.set(paramName, paramValue);
    }
    return this.http.post<T>(this.adminBaseUrl, formData, { params });
  }

  protected updateField(id: number, field: string, value: string | null): Observable<T> {
    return this.http.put<T>(`${this.adminBaseUrl}/${id}`, { [field]: value });
  }
}
