import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { DashboardStats } from './types';
import { useNavigate } from 'react-router-dom';

interface OverviewCardsProps {
  stats: DashboardStats & {
    warningUPS?: number;
    riskyUPS?: number;
    healthyUPS?: number;
  };
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const navigate = useNavigate();
  
  const handleCardClick = (title: string) => {
    switch (title) {
      case 'Healthy UPS':
        navigate('/ups-list?status=healthy');
        break;
      case 'Failed UPS':
        navigate('/ups-list?status=failed');
        break;
      case 'Warning UPS':
        navigate('/ups-list?status=warning');
        break;
      case 'Risky UPS':
        navigate('/ups-list?status=risky');
        break;
      case 'Alerts':
        navigate('/alerts');
        break;
      default:
        // For Total UPS, navigate to UPS list without filter
        navigate('/ups-list');
        break;
    }
  };
  
  const cards = [
    {
      title: 'Total UPS',
      value: stats.totalUPS,
      icon: Activity,
      className: 'border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 hover:cursor-pointer transition-all duration-200',
      iconClassName: 'text-primary',
      clickable: true
    },
    {
      title: 'Healthy UPS',
      value: stats.healthyUPS || stats.activeUPS,
      icon: CheckCircle,
      className: 'border-l-4 border-l-success bg-gradient-to-r from-success/5 to-transparent hover:from-success/10 hover:cursor-pointer transition-all duration-200',
      iconClassName: 'text-success',
      clickable: true
    },
    {
      title: 'Failed UPS',
      value: stats.failedUPS,
      icon: XCircle,
      className: 'border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-transparent hover:from-destructive/10 hover:cursor-pointer transition-all duration-200',
      iconClassName: 'text-destructive',
      clickable: true
    },
    {
      title: 'Warning UPS',
      value: stats.warningUPS || 0,
      icon: AlertTriangle,
      className: 'border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-transparent hover:from-warning/10 hover:cursor-pointer transition-all duration-200',
      iconClassName: 'text-warning',
      clickable: true
    },
    {
      title: 'Risky UPS',
      value: stats.riskyUPS || 0,
      icon: AlertTriangle,
      className: 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-500/5 to-transparent hover:from-orange-500/10 hover:cursor-pointer transition-all duration-200',
      iconClassName: 'text-orange-600',
      clickable: true
    },
    {
      title: 'Alerts',
      value: stats.predictionsCount || 0,
      icon: AlertTriangle,
      className: 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent hover:from-purple-500/10 hover:cursor-pointer transition-all duration-200',
      iconClassName: 'text-purple-600',
      clickable: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card) => (
        <div 
          key={card.title} 
          className={`metric-card ${card.className}`}
          onClick={() => handleCardClick(card.title)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
            </div>
            <card.icon className={`h-8 w-8 ${card.iconClassName}`} />
          </div>
        </div>
      ))}
    </div>
  );
}