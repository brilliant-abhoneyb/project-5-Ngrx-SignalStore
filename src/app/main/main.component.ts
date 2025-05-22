import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { BooksStore } from '../data-access/books.store';
import { debounceTime, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class MainComponent {
  private readonly booksStore = inject(BooksStore);

  readonly books = this.booksStore.filteredBooks;
  readonly isLoading = this.booksStore.isLoading;
  readonly categories = this.booksStore.categories;
  readonly years = this.booksStore.years;
  readonly totalPages = this.booksStore.totalPages;
  readonly currentPage = this.booksStore.currentPage;

  readonly searchControl = new FormControl('');
  readonly searchTermSignal = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(500)),
    { initialValue: '' }
  );

  readonly selectedCategory = signal('');
  readonly selectedYear = signal('');

  constructor() {
    effect(() => {
      const query = this.searchTermSignal();
      this.booksStore.updateSearchTerm(query!);
      this.booksStore.updatePage(1);
    });

    effect(() => {
      this.booksStore.updateCategory(this.selectedCategory());
    });

    effect(() => {
      const year = this.selectedYear();
      this.booksStore.updateYear(this.selectedYear()); 
    });

    effect(() => {
      const page = this.currentPage();
      const query = this.booksStore.searchTerm();
      this.booksStore.loadByTitle({ query, page, limit: 20 });
    });
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
  }

  onYearChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedYear.set(value);
  }

  paginatedPages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 1 || this.books().length === 0) return pages;

    const maxVisible = 5;
    const start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      if (i <= total) {
        pages.push(i);
      }
    }
    return pages;
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.booksStore.updatePage(page);
  }
}



























