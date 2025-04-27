'use client';

import { useEffect } from 'react';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        {/* Div com as informações de teste */}
        

        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        <LoginForm />
        <div className="bg-muted/50 border rounded-lg p-2 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1 pb-2 border-b">
            Credenciais para teste:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium min-w-[4rem]">Email:</span>
              <code className="bg-muted px-2 py-0.5 rounded text-muted-foreground ml-2">
                test@email.com
              </code>
            </div>
            <div className="flex items-center">
              <span className="font-medium min-w-[4rem]">Senha:</span>
              <code className="bg-muted px-2 py-0.5 rounded text-muted-foreground ml-2">
                Vi12345678
              </code>
            </div>   
          </div>
        </div>
      </div>
      
    </div>
  );
}

