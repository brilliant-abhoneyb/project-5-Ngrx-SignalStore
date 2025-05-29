import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type SearchBooksQuery = {
  query: string;
  page: number;
  limit: number;
};

@Injectable({
  providedIn: 'root',
})
export class BookItemService {
  private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(private http: HttpClient) {}

  searchBooks(query: string, page: number, limit: number): Observable<any> {
    const startIndex = (page - 1) * limit;
    const apiUrl = `${this.apiUrl}?q=${encodeURIComponent(query || 'book')}&startIndex=${startIndex}&maxResults=${limit}`;
    return this.http.get<any>(apiUrl).pipe(
      map((res) => ({
        books:
          res.items?.map((item: any) => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors?.join(', ') || 'Unknown',
            description: item.volumeInfo.description || 'No description available',
            previewLink: item.volumeInfo.previewLink || '',
            coverId: item.volumeInfo.imageLinks?.thumbnail || null,
            publisher: item.volumeInfo.publisher || '',
            year: item.volumeInfo.publishedDate || '',
            category: item.volumeInfo.categories?.join(', ') || '',
            pageCount: item.volumeInfo.pageCount || '',
            language: item.volumeInfo.language || '',
            rating: item.volumeInfo.averageRating || 0,
          })) || [],
        totalFound: res.totalItems || 0,
      }))
    );
  }
}
