'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { livrosApi, locacoesApi, usuariosApi } from '@/lib/api';
import { Book, Loan, User } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { BookOpenText, Clock, Users, BookCheck, BarChart } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalLivros, setTotalLivros] = useState(0);
  const [livrosDisponiveis, setLivrosDisponiveis] = useState(0);
  const [totalLocacoes, setTotalLocacoes] = useState(0);
  const [locacoesAtivas, setLocacoesAtivas] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [generoData, setGeneroData] = useState<Array<{ name: string; value: number }>>([]);
  const [estadoData, setEstadoData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch books data
        const livrosData = await livrosApi.getAll();
        setTotalLivros(livrosData.length);
        
        const disponiveis = livrosData.filter((livro: Book) => livro.disponivelLocacao).length;
        setLivrosDisponiveis(disponiveis);
        
        // Process book data for charts
        const generos: Record<string, number> = {};
        const estados: Record<string, number> = {};
        
        livrosData.forEach((livro: Book) => {
          generos[livro.genero] = (generos[livro.genero] || 0) + 1;
          estados[livro.estadoConservacao] = (estados[livro.estadoConservacao] || 0) + 1;
        });
        
        setGeneroData(Object.entries(generos).map(([name, value]) => ({ name, value })));
        setEstadoData(Object.entries(estados).map(([name, value]) => ({ name, value })));
        
        // Fetch loans data
        const locacoesData = await locacoesApi.getAll();
        setTotalLocacoes(locacoesData.length);
        
        const ativas = locacoesData.filter((locacao: Loan) => locacao.status === 'ATIVA').length;
        setLocacoesAtivas(ativas);
        
        // Fetch users data if admin
        if (isAdmin) {
          const usuariosData = await usuariosApi.getAll();
          setTotalUsuarios(usuariosData.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isAdmin]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Livros"
            value={totalLivros}
            description="Livros cadastrados"
            icon={<BookOpenText className="h-6 w-6 text-blue-600" />}
            loading={loading}
            href="/livros"
          />
          <StatsCard
            title="Livros Disponíveis"
            value={livrosDisponiveis}
            description="Disponíveis para locação"
            icon={<BookCheck className="h-6 w-6 text-green-600" />}
            loading={loading}
            href="/livros"
          />
          <StatsCard
            title="Locações Ativas"
            value={locacoesAtivas}
            description="Locações em andamento"
            icon={<Clock className="h-6 w-6 text-amber-600" />}
            loading={loading}
            href="/locacoes"
          />
          {isAdmin && (
            <StatsCard
              title="Usuários"
              value={totalUsuarios}
              description="Usuários cadastrados"
              icon={<Users className="h-6 w-6 text-purple-600" />}
              loading={loading}
              href="/usuarios"
            />
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                <span>Livros por Gênero</span>
              </CardTitle>
              <CardDescription>Distribuição do acervo por categorias</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={generoData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5" />
                <span>Estado de Conservação</span>
              </CardTitle>
              <CardDescription>Condição dos livros no acervo</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadoData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {estadoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
  href: string;
}

function StatsCard({ title, value, description, icon, loading, href }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full justify-center p-0" asChild>
          <Link href={href}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}





