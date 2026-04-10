export interface Product {
  id: string;
  ten_sp: string;
  gia: number;
  gia_km?: number;
  mo_ta?: string;
  hinh?: string;

  categoryId?: string;
  hot?: number;
  stock?: number;
  createdAt?: string;
}
