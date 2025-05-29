import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  BookItemService,
  SearchBooksQuery,
} from '../services/book-item.service';
import { tap, map, catchError, of, finalize, pipe, switchMap } from 'rxjs';
import { Book } from '../models/book.model';

interface BooksState {
  books: Book[];
  isLoading: boolean;
  searchTerm: string;
  categories: string[];
  years: string[];
  selectedCategory: string;
  selectedYear: string;
  totalPages: number;
  currentPage: number
}

const initialState: BooksState = {
  books: [],
  isLoading: false,
  searchTerm: '',
  categories: [],
  years: [],
  selectedCategory: '',
  selectedYear: '',
  totalPages: 5,
  currentPage: 1
};

export const BooksStore = signalStore(
  { providedIn: 'root' },
  withState<BooksState>(initialState),
  withComputed((store) => ({ })),
  withMethods((store, bookService = inject(BookItemService)) => ({
    loadByTitle: rxMethod<SearchBooksQuery>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((query) =>
          bookService.searchBooks(query.query, query.page, query.limit, store.selectedCategory(), store.selectedYear()).pipe(
            map((response) => {
              const extractUnique = (items: string[]): string[] => 
                items.filter((item: string, index: number) => items.indexOf(item) === index);
            
              const totalItems = response.totalFound;
              const totalPages = Math.max(1, Math.ceil(totalItems / query.limit));
              const isValidPage = response.books.length === query.limit || 
              (query.page === totalPages && response.books.length > 0);

              return {
                books: response.books,
                totalPages,
                isValidPage,
                categories: extractUnique(
                  response.books
                    .flatMap((book: Book) => book.category.split(', '))
                    .filter((category: string) => category.trim() !== '')
                ),
                years: extractUnique(
                  response.books
                    .map((book: Book) => book.year?.substring(0, 4) || '')
                    .filter((year: string) => year.trim() !== '')
                )
              };
            }),
            tap(({ books, totalPages, isValidPage, categories, years }) => {
              if (isValidPage) {
                patchState(store, { books, totalPages, categories, years, currentPage: Math.min(store.currentPage(), totalPages)});
            }}),
            catchError(() => {
              patchState(store, { books: [], totalPages: 1, currentPage: 1 });
              return of(null);
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),
    updateTitle(title: string) {
      patchState(store, { books: [], currentPage: 1 });
      this.loadByTitle({
        query: title,
        page: 1,
        limit: 20,
        category: store.selectedCategory(),
        year: store.selectedYear()
      });
    },

    updateSearchTerm(searchTerm: string) {
      patchState(store, { searchTerm: searchTerm });
    },

    updateCategory(category: string) {
      patchState(store, { selectedCategory: category, currentPage: 1 });
      this.loadByTitle({
        query: store.searchTerm(),
        page: 1,
        limit: 20,
        category,
        year: store.selectedYear()
      });
    },
    
    updateYear(year: string) {
      patchState(store, { selectedYear: year, currentPage: 1 });
      this.loadByTitle({
        query: store.searchTerm(),
        page: 1,
        limit: 20,
        category: store.selectedCategory(),
        year
      });
    },    

    updatePage(page: number) {
      patchState(store, { currentPage: page });
      this.loadByTitle({
        query: store.searchTerm(),
        page,
        limit: 20,
        category: store.selectedCategory(),
        year: store.selectedYear()
      });
    },
  }))
);