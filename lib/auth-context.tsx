'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { User, AuthContextType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      const data = await authApi.login(email, senha);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      setUser(data.usuario);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${data.usuario.nome}!`,
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.response?.data?.message || "Ocorreu um erro ao tentar fazer login.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { nome: string; email: string; senha: string; idade: number }) => {
    try {
      setLoading(true);
      const data = await authApi.register(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      setUser(data.usuario);
      
      toast({
        title: "Registro realizado com sucesso",
        description: "Sua conta foi criada e você já está logado.",
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar",
        description: error.response?.data?.message || "Ocorreu um erro ao tentar registrar.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};