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
    try {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
      if (savedUser && token && savedUser !== 'undefined') {
        const parsedUser = JSON.parse(savedUser);
        // Verifica se o objeto do usuário tem todas as propriedades necessárias
        if (parsedUser && parsedUser.nome && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
        } else {
          // Se os dados estiverem incompletos, limpa o localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        // Se não houver dados válidos, limpa o localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      // Se houver erro ao parsear, limpa o localStorage
      console.error('Erro ao carregar dados do usuário:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      const data = await authApi.login(email, senha);
      
      // Verifica se os dados necessários estão presentes
      if (!data || !data.token || !data.usuario) {
        throw new Error('Dados de login inválidos');
      }

      // Verifica se o objeto do usuário tem todas as propriedades necessárias
      if (!data.usuario.nome || !data.usuario.email || !data.usuario.role) {
        throw new Error('Dados do usuário incompletos');
      }

      // Remove a senha antes de salvar no localStorage
      const { senha: _, ...userWithoutPassword } = data.usuario;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${data.usuario.nome}!`,
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Ocorreu um erro ao tentar fazer login.";
      
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: errorMessage,
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

      // Remove a senha antes de salvar no localStorage
      const { senha: _, ...userWithoutPassword } = data.usuario;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
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
    // Limpa todo o localStorage
    localStorage.clear();
    setUser(null);
    router.push('/login');
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      // Garantir que apenas as propriedades do tipo User sejam atualizadas
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

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
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