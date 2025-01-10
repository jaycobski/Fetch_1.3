import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
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

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

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
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      toast.success('Welcome back!');
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
          Welcome Back
        </h1>
        <p className="text-muted-foreground" style={{ color: BRAND.colors.text.muted }}>
          Enter your credentials to sign in
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
            {isLoading ? 'Loading...' : 'Sign In'}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2">
        <Link to="/register">
          <Button
            variant="link"
            className="text-sm font-medium"
            style={{ color: BRAND.colors.primary.DEFAULT }}
          >
            Don't have an account? Sign up
          </Button>
        </Link>
      </div>
    </div>
  );
}