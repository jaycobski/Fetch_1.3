import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Don't redirect during OAuth callback
  if (location.hash.includes("access_token")) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}