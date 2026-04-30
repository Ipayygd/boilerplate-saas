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
  bayargg_invoice_id: string;
  amount: number;
  final_amount?: number;
  unique_code?: number;
  description: string;
  payment_method: "qris" | "qris_user" | "gopay_qris" | "ovo";
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  payment_url?: string;
  created_at: string;
  updated_at: string;
}

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };
