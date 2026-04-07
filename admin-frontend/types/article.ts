export interface Article {
  _id: string;
  id: string;
  title_vi: string;
  slug_vi?: string;
  keyword?: string;
  alt?: string;
  image?: string;
  short_description_vi?: string;
  content_vi: string;
  num?: number;
  createdAt?: string;
  updatedAt?: string;
}
