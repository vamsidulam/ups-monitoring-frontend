import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, FileText, Settings, Power, AlertTriangle } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'UPS List', url: '/ups-list', icon: List },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Alerts', url: '/alerts', icon: AlertTriangle },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (currentPath === path) return true;
    if (currentPath.startsWith(path + '/')) return true;
    return false;
  };

  const getNavClass = (path: string) =>
    isActive(path)
      ? 'bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-l-sidebar-primary'
      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary transition-colors';

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Power className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">UPS Monitor</h2>
              <p className="text-xs text-sidebar-foreground/60">Power Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-8 pt-6 border-t border-sidebar-border">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="status-indicator status-healthy" />
              {!collapsed && <span className="text-xs text-sidebar-foreground/80">System Online</span>}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              {!collapsed && <span className="text-xs text-sidebar-foreground/80">Live Updates</span>}
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}