import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const getBreadcrumbItems = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((part, index) => ({
    label: part.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    path: '/' + parts.slice(0, index + 1).join('/')
  }));
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();
  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <Button onClick={signOut} variant="outline">Sign Out</Button>
        </div>
      </header>
      <main className="container py-8">
        <nav className="flex items-center space-x-2 mb-6 text-sm text-muted-foreground">
          <Link to="/dashboard" className="flex items-center hover:text-foreground">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbItems.map((item, index) => (
            <div key={item.path} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              <Link
                to={item.path}
                className={index === breadcrumbItems.length - 1 
                  ? "font-medium text-foreground"
                  : "hover:text-foreground"
                }
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>
        {children}
      </main>
    </div>
  );
}