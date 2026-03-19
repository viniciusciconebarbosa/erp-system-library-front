'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { User, AuthContextType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (savedUser && token && savedUser !== 'undefined') {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.nome && parsedUser?.email && parsedUser?.role) {
          setUser(parsedUser);
        } else {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch {
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      const data = await authApi.login(email, senha);

      if (!data?.token || !data?.usuario) {
        toast({
          variant: 'destructive',
          title: 'Erro na autenticação',
          description: data?.response?.data?.message ?? 'Email ou senha incorretos.',
        });
        return;
      }

      if (!data.usuario.nome || !data.usuario.email || !data.usuario.role) {
        toast({
          variant: 'destructive',
          title: 'Perfil incompleto',
          description: 'Seus dados de perfil estão faltando informações.',
        });
        return;
      }

      const { senha: _, ...userWithoutPassword } = data.usuario;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);

      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${data.usuario.nome}!`,
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error.response?.data?.message ?? 'Email ou senha incorretos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { nome: string; email: string; senha: string; idade: number }) => {
    try {
      setLoading(true);
      const data = await authApi.register(userData);

      if (!data?.token || !data?.usuario) {
        toast({
          variant: 'destructive',
          title: 'Erro no registro',
          description: 'Resposta inválida do servidor.',
        });
        return;
      }

      if (!data.usuario.nome || !data.usuario.email || !data.usuario.role) {
        toast({
          variant: 'destructive',
          title: 'Perfil incompleto',
          description: 'Os dados retornados estão incompletos.',
        });
        return;
      }

      const { senha: _, ...userWithoutPassword } = data.usuario;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);

      toast({
        title: 'Registro realizado com sucesso',
        description: 'Sua conta foi criada e você já está logado.',
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar',
        description: error.response?.data?.message ?? 'Erro ao tentar registrar.',
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);

    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });

    router.push('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        nome: userData.nome ?? user.nome,
        email: userData.email ?? user.email,
        idade: userData.idade ?? user.idade,
        role: userData.role ?? user.role,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};