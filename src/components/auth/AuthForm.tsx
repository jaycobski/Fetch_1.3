import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { BRAND } from '@/config/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof formSchema>;

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const { error } = isLogin
        ? await supabase.auth.signInWithPassword(data)
        : await supabase.auth.signUp(data);

      if (error) throw error;
      toast.success(isLogin ? 'Welcome back!' : 'Check your email to confirm your account');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 p-8 bg-card rounded-lg border shadow-lg">
      <div className="space-y-4 text-center">
        <img src={BRAND.logoUrl} alt={BRAND.name} className="h-10 mx-auto dark:invert-[.85]" />
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: BRAND.fonts.sans }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-muted-foreground" style={{ color: BRAND.colors.text.muted }}>
          {isLogin ? 'Enter your credentials to sign in' : 'Enter your details to create an account'}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ color: BRAND.colors.text.secondary }}>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ color: BRAND.colors.text.secondary }}>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            style={{
              backgroundColor: BRAND.colors.primary.DEFAULT,
              color: '#ffffff',
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2">
        <Button
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm font-medium"
          style={{ color: BRAND.colors.primary.DEFAULT }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </Button>
      </div>
    </div>
  );
}