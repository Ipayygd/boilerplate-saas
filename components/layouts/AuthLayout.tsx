import { APP_NAME } from "@/constants";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white border rounded-xl shadow-sm p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-400 font-medium">{APP_NAME}</p>
          <h1 className="text-xl font-semibold mt-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
