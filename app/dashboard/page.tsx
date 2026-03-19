'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generoLabels, estadoConservacaoLabels } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { BookOpenText, Clock, Users, BookCheck, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useDashboard } from '@/hooks/use-dashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

const COLORS = ['#493082', '#2563eb', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { stats, loading, refresh } = useDashboard();
  const { totalLivros, livrosDisponiveis, locacoesAtivas, totalUsuarios, generoData, conservacaoData } = stats;

  const barChartData = {
    labels: conservacaoData.map((item) => estadoConservacaoLabels[item.nome as keyof typeof estadoConservacaoLabels] || item.nome),
    datasets: [{
      label: 'Quantidade',
      data: conservacaoData.map((item) => item.quantidade),
      backgroundColor: ['#493082', '#2563eb', '#f97316', '#ef4444'],
      borderRadius: 4,
    }],
  };

  const barChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw || 0;
            const total = conservacaoData.reduce((acc, curr) => acc + curr.quantidade, 0);
            return `${value} livros (${((value / total) * 100).toFixed(1)}%)`;
          },
        },
      },
    },
    scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  const pieChartData = {
    labels: generoData.map((item) => generoLabels[item.nome as keyof typeof generoLabels] || item.nome),
    datasets: [{ data: generoData.map((item) => item.quantidade), backgroundColor: COLORS }],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            return `${context.label}: ${context.raw} (${((context.raw * 100) / total).toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="animate-spin" style={{ animationPlayState: loading ? 'running' : 'paused' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Atualizar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total de Livros" value={totalLivros} description="Livros cadastrados"
            icon={<BookOpenText className="h-6 w-6 text-blue-600" />} loading={loading} href="/livros" />
          <StatsCard title="Livros Disponíveis" value={livrosDisponiveis} description="Disponíveis para locação"
            icon={<BookCheck className="h-6 w-6 text-green-600" />} loading={loading} href="/livros" />
          <StatsCard title="Locações Ativas" value={locacoesAtivas} description="Locações em andamento"
            icon={<Clock className="h-6 w-6 text-amber-600" />} loading={loading} href="/locacoes" />
          {isAdmin && (
            <StatsCard title="Usuários" value={totalUsuarios} description="Usuários cadastrados"
              icon={<Users className="h-6 w-6 text-purple-600" />} loading={loading} href="/usuarios" />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="card-dashboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                <span>Estado de Conservação</span>
              </CardTitle>
              <CardDescription>Condição atual dos livros no acervo</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              {loading ? <Skeleton className="h-full w-full" /> : conservacaoData.length > 0 ? (
                <div className="h-full w-full"><Bar data={barChartData} options={barChartOptions} /></div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Nenhum dado disponível sobre o estado de conservação dos livros
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-dashboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText className="h-5 w-5" />
                <span>Gêneros de livros no acervo</span>
              </CardTitle>
              <CardDescription>Distribuição por categorias</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              {loading ? <Skeleton className="h-full w-full" /> : generoData.length > 0 ? (
                <div className="h-full w-full"><Pie data={pieChartData} options={pieChartOptions} /></div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Nenhum dado disponível sobre os gêneros dos livros
                </div>
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
        {loading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
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
