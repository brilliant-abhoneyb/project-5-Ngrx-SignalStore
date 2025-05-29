import { Book } from "./book.model";

export interface BooksState {
    books: Book[],
    isLoading: boolean,
    searchTerm: string,
    categories: string[],
    years: string[],
    selectedCategory: string,
    selectedYear: string,
    totalPages: number,
    currentPage: number
}
  
export const initialState: BooksState = {
    books: [],
    isLoading: false,
    searchTerm: '',
    categories: [],
    years: [],
    selectedCategory: '',
    selectedYear: '',
    totalPages: 1,
    currentPage: 1
};

export type SearchBooksQuery = {
    query: string;
    page: number;
    limit: number;
    category?: string;
    year?: string;
};
  