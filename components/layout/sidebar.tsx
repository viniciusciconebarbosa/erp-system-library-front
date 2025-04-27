'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
  BookOpen,
  Home,
  Library,
  UserCircle,
  Users,
  LogOut,
  Menu,
  X,
  CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const routes = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Livros',
      icon: BookOpen,
      href: '/livros',
      active: pathname.startsWith('/livros'),
    },
    {
      label: 'Locações',
      icon: CalendarClock,
      href: '/locacoes',
      active: pathname.startsWith('/locacoes'),
    },
    {
      label: 'Meu Perfil',
      icon: UserCircle,
      href: '/perfil',
      active: pathname === '/perfil',
    },
  ];

  // Admin-only routes
  if (isAdmin) {
    routes.push({
      label: 'Usuários',
      icon: Users,
      href: '/usuarios',
      active: pathname.startsWith('/usuarios'),
    });
  }

  const SidebarContent = () => (
    <>
      <div className="mb-4 px-4 py-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Library className="h-6 w-6" />
          <span className="text-xl">Biblioteca</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                route.active ? 'bg-accent text-accent-foreground' : 'transparent'
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto px-4 py-4">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 flex flex-col">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={cn("hidden md:flex flex-col h-screen border-r", className)}>
        <SidebarContent />
      </div>
    </>
  );
}