export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  active: number; // 1 = true, 0 = false (SQLite)
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "user";
  active: number;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;
export type UserInput = Omit<User, "id" | "created_at" | "updated_at">;
