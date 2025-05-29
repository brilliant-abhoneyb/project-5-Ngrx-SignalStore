export interface Book {
  title: string;
  author: string;
  description: string;
  previewLink: string;
  coverId: string | null;
  publisher: string;
  year: string;
  category: string;
  pageCount: number | string;
  language: string;
  rating: number | string;
}

export interface BookSearchResult {
  books: Book[];
  totalFound: number;
}

export interface GoogleBooksApiResponse {
  items: [
    {
      volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        previewLink?: string;
        imageLinks?: 
        { 
          thumbnail?: string 
        };
        publisher?: string;
        publishedDate?: string;
        categories?: string[];
        pageCount?: number;
        language?: string;
        averageRating?: number;
      };
    }
  ];
  totalItems: number;
}