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
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be less than 72 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const officeEmptyMessages = [
  "Empty like Michael's 'World's Best Boss' mug",
  "Blank like Stanley's crossword puzzle",
  "Missing like Dwight's stapler in jello",
  "Vacant like Kevin's M&M jar",
];

function getRandomEmptyMessage() {
  return officeEmptyMessages[Math.floor(Math.random() * officeEmptyMessages.length)];
}

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });
      
      if (error) throw error;
      toast.success("Registration successful! Please check your email to confirm your account.");
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
          Create Account
        </h1>
        <p className="text-muted-foreground" style={{ color: BRAND.colors.text.muted }}>
          Enter your details to create an account
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ color: BRAND.colors.text.secondary }}>First Name</FormLabel>
                <FormControl>
                  <Input placeholder={getRandomEmptyMessage()} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ color: BRAND.colors.text.secondary }}>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder={getRandomEmptyMessage()} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ color: BRAND.colors.text.secondary }}>Email</FormLabel>
                <FormControl>
                  <Input placeholder="michael.scott@dundermifflin.com" {...field} />
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ color: BRAND.colors.text.secondary }}>Confirm Password</FormLabel>
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
            {isLoading ? 'Loading...' : 'Sign Up'}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-2">
        <Link to="/login">
          <Button
            variant="link"
            className="text-sm font-medium"
            style={{ color: BRAND.colors.primary.DEFAULT }}
          >
            Already have an account? Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}