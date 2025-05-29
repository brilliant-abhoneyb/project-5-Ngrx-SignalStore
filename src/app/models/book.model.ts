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
