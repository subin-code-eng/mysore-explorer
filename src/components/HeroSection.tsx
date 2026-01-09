import { motion } from 'framer-motion';
import { useTourism } from '@/contexts/TourismContext';
import { getCurrentTimeOfDay, isPeakSeason } from '@/lib/crowdEngine';
import { Sun, Sunset, Moon, AlertCircle } from 'lucide-react';

const timeGreetings = {
  morning: { greeting: 'Good Morning', icon: Sun, suggestion: 'Perfect for outdoor exploration' },
  afternoon: { greeting: 'Good Afternoon', icon: Sunset, suggestion: 'Great time for indoor attractions' },
  evening: { greeting: 'Good Evening', icon: Moon, suggestion: 'Ideal for lakes and cultural walks' },
};

export function HeroSection() {
  const { selectedInterests } = useTourism();
  const timeOfDay = getCurrentTimeOfDay();
  const peakSeason = isPeakSeason();
  const timeInfo = timeGreetings[timeOfDay];
  const TimeIcon = timeInfo.icon;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative py-12 md:py-16 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Time greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-soft mb-6"
        >
          <TimeIcon className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">{timeInfo.greeting}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{timeInfo.suggestion}</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
        >
          Explore <span className="text-gradient-primary">Mysore</span>{' '}
          <br className="hidden md:block" />
          Beyond the Crowds
        </motion.h1>

        {/* Problem statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <p className="text-lg text-muted-foreground leading-relaxed">
            This system decentralises tourism in Mysore by analysing crowd levels and 
            intelligently redirecting tourists to less crowded alternative locations 
            based on <strong className="text-foreground">interest</strong>, <strong className="text-foreground">time</strong>, and <strong className="text-foreground">zones</strong>.
          </p>
        </motion.div>

        {/* Peak season alert */}
        {peakSeason && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200"
          >
            <AlertCircle size={18} />
            <span className="font-medium">Peak Season Active</span>
            <span className="text-amber-700">— Follow our suggestions to avoid crowds!</span>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
