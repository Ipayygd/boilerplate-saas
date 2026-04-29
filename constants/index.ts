export const APP_NAME = "My App";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  PAYMENT: "/payment",
  PAYMENT_SUCCESS: "/payment/success",
  PAYMENT_FAILED: "/payment/failed",
} as const;

export const PROTECTED_ROUTES = ["/dashboard", "/payment"];
export const AUTH_ROUTES = ["/auth/login", "/auth/register"];
