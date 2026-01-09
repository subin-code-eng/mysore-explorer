import { CrowdLevel } from '@/data/places';
import { cn } from '@/lib/utils';
import { Users, TrendingDown, AlertTriangle } from 'lucide-react';

interface CrowdBadgeProps {
  level: CrowdLevel;
  percentage?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const crowdConfig: Record<CrowdLevel, { 
  label: string; 
  shortLabel: string;
  icon: typeof Users;
  className: string;
  bgClassName: string;
}> = {
  low: {
    label: 'Peaceful Right Now',
    shortLabel: 'Low Crowd',
    icon: TrendingDown,
    className: 'text-green-700',
    bgClassName: 'bg-green-100 border-green-200',
  },
  medium: {
    label: 'Moderate Crowds',
    shortLabel: 'Medium Crowd',
    icon: Users,
    className: 'text-yellow-700',
    bgClassName: 'bg-yellow-100 border-yellow-200',
  },
  high: {
    label: 'Crowded – Try Alternatives',
    shortLabel: 'High Crowd',
    icon: AlertTriangle,
    className: 'text-red-700',
    bgClassName: 'bg-red-100 border-red-200',
  },
};

export function CrowdBadge({ 
  level, 
  percentage, 
  showPercentage = false, 
  size = 'md',
  className 
}: CrowdBadgeProps) {
  const config = crowdConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.bgClassName,
        config.className,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} />
      <span>{size === 'sm' ? config.shortLabel : config.label}</span>
      {showPercentage && percentage !== undefined && (
        <span className="opacity-70">({percentage}%)</span>
      )}
    </span>
  );
}

interface HiddenGemBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HiddenGemBadge({ size = 'md', className }: HiddenGemBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        'bg-primary/10 border-primary/20 text-primary',
        sizeClasses[size],
        className
      )}
    >
      ✨ Hidden Gem
    </span>
  );
}
