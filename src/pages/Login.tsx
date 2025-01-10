import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { BRAND } from '@/config/brand';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background"
      style={{ 
        fontFamily: BRAND.fonts.sans,
        background: `linear-gradient(to bottom right, ${BRAND.colors.primary.light}, ${BRAND.colors.primary.DEFAULT})`
      }}
    >
      <LoginForm />
    </div>
  );
}