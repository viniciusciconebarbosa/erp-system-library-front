'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { livrosApi, locacoesApi, usuariosApi } from '@/lib/api';
import { Book, User } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { BookOpenText, Clock, Users, BookCheck, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Registrar os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalLivros, setTotalLivros] = useState(0);
  const [livrosDisponiveis, setLivrosDisponiveis] = useState(0);
  const [locacoesAtivas, setLocacoesAtivas] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [generoData, setGeneroData] = useState<Array<{ name: string; value: number }>>([]);
  const [estadoData, setEstadoData] = useState<Array<{ name: string; value: number }>>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const livrosData = await livrosApi.getAll();
      setTotalLivros(livrosData.length);
      
      const disponiveis = livrosData.filter((livro: Book) => livro.disponivelLocacao).length;
      setLivrosDisponiveis(disponiveis);
      
      const generos: Record<string, number> = {};
      const estados: Record<string, number> = {};
      
      livrosData.forEach((livro: Book) => {
        generos[livro.genero] = (generos[livro.genero] || 0) + 1;
        estados[livro.estadoConservacao] = (estados[livro.estadoConservacao] || 0) + 1;
      });
      
      setGeneroData(Object.entries(generos).map(([name, value]) => ({ name, value })));
      setEstadoData(Object.entries(estados).map(([name, value]) => ({ name, value })));
      
      const quantidadeAtivas = await locacoesApi.getQuantidadeAtivas();
      const numeroAtivas = typeof quantidadeAtivas === 'number' ? quantidadeAtivas : 0;
      setLocacoesAtivas(numeroAtivas);
      
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

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Configuração do gráfico de barras
  const barChartData = {
    labels: generoData.map(item => item.name),
    datasets: [
      {
        label: 'Quantidade',
        data: generoData.map(item => item.value),
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Configuração do gráfico de pizza
  const pieChartData = {
    labels: estadoData.map(item => item.name),
    datasets: [
      {
        data: estadoData.map(item => item.value),
        backgroundColor: COLORS,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            className="gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
              style={{ animationPlayState: loading ? 'running' : 'paused' }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Atualizar
          </Button>
        </div>

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
                <Bar data={barChartData} options={barChartOptions} />
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
                <Pie data={pieChartData} options={pieChartOptions} />
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





