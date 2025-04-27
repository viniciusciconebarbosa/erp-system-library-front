import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <DashboardLayout title="Carregando...">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-[360px] w-[240px]" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    </DashboardLayout>
  );
}