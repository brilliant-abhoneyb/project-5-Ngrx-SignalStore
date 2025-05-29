import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Book, BookSearchResult, GoogleBooksApiResponse } from '../models/book.model';


@Injectable({
  providedIn: 'root',
})
export class BookItemService {
  private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(private http: HttpClient) {}

  searchBooks(query: string, page: number, limit: number, category?: string, year?: string): Observable<BookSearchResult> {
    const startIndex = (page - 1) * limit;
    let fullQuery = query || 'book';
    if (category) fullQuery += `+subject:${category}`;
    const apiUrl = `${this.apiUrl}?q=${encodeURIComponent(fullQuery)}&startIndex=${startIndex}&maxResults=${limit}`;
  
    return this.http.get<GoogleBooksApiResponse>(apiUrl).pipe(
      map((response) => {
        let books: Book[] = response.items?.map((item) => ({
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
        })) || [];
  
        if (year) {
          books = books.filter((book: { year: string; }) => book.year.startsWith(year));
        }
  
        return {
          books,
          totalFound: response.totalItems || books.length, 
        };
      })
    );
  }
}
