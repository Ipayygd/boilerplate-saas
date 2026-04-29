export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  external_id: string;
  amount: number;
  description: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  invoice_url?: string;
  xendit_invoice_id?: string;
  created_at: string;
  updated_at: string;
}

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };
