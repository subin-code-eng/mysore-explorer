import { motion } from 'framer-motion';
import { Menu, X, Map, Settings, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTourism } from '@/contexts/TourismContext';
import { interests } from '@/data/places';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onResetInterests: () => void;
}

export function Header({ onResetInterests }: HeaderProps) {
  const { selectedInterests, hasSelectedInterests } = useTourism();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
              <Map className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-foreground leading-tight">
                Decentralised Tourism
              </h1>
              <p className="text-xs text-muted-foreground">Mysore</p>
            </div>
          </div>

          {/* Selected Interests (Desktop) */}
          {hasSelectedInterests && (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Your interests:</span>
              <div className="flex gap-1">
                {selectedInterests.map(interest => (
                  <span
                    key={interest}
                    className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {interests[interest].icon}
                  </span>
                ))}
              </div>
              <button
                onClick={onResetInterests}
                className="ml-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                title="Change interests"
              >
                <RefreshCw size={16} className="text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden bg-background border-b border-border"
      >
        <div className="px-4 py-4 space-y-4">
          {hasSelectedInterests && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Your interests:</span>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map(interest => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {interests[interest].icon} {interests[interest].name}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  onResetInterests();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <RefreshCw size={14} />
                Change interests
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </header>
  );
}
