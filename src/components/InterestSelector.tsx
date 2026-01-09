import { motion } from 'framer-motion';
import { interests, Interest } from '@/data/places';
import { useTourism } from '@/contexts/TourismContext';
import { cn } from '@/lib/utils';

const interestColors: Record<Interest, string> = {
  heritage: 'from-amber-500 to-orange-600',
  nature: 'from-emerald-500 to-teal-600',
  culture: 'from-purple-500 to-indigo-600',
  spiritual: 'from-orange-500 to-red-500',
  relaxation: 'from-cyan-500 to-blue-600',
};

const interestBorders: Record<Interest, string> = {
  heritage: 'border-amber-300 hover:border-amber-400',
  nature: 'border-emerald-300 hover:border-emerald-400',
  culture: 'border-purple-300 hover:border-purple-400',
  spiritual: 'border-orange-300 hover:border-orange-400',
  relaxation: 'border-cyan-300 hover:border-cyan-400',
};

interface InterestSelectorProps {
  onComplete: () => void;
}

export function InterestSelector({ onComplete }: InterestSelectorProps) {
  const { selectedInterests, toggleInterest, setInterests } = useTourism();

  const handleContinue = () => {
    if (selectedInterests.length > 0) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pattern-heritage">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <span className="text-5xl mb-4 block">🏛️</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Welcome to <span className="text-gradient-primary">Mysore</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Let's personalize your journey. What draws you to this royal city?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
        >
          {(Object.keys(interests) as Interest[]).map((key, index) => {
            const interest = interests[key];
            const isSelected = selectedInterests.includes(key);

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInterest(key)}
                className={cn(
                  'relative p-6 rounded-2xl border-2 transition-all duration-300',
                  'bg-card shadow-card hover:shadow-elevated',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : interestBorders[key]
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="absolute inset-0 rounded-2xl bg-primary/5"
                    initial={false}
                  />
                )}
                <div className="relative z-10">
                  <span className="text-4xl block mb-3">{interest.icon}</span>
                  <h3 className="font-semibold text-foreground mb-1">
                    {interest.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {interest.description}
                  </p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <span className="text-primary-foreground text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="space-y-4"
        >
          <button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
            className={cn(
              'px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300',
              'bg-gradient-accent text-primary-foreground shadow-elevated',
              'hover:shadow-xl hover:scale-105',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
          >
            Explore Mysore
            {selectedInterests.length > 0 && (
              <span className="ml-2 opacity-80">
                ({selectedInterests.length} selected)
              </span>
            )}
          </button>
          <p className="text-sm text-muted-foreground">
            Select one or more interests to get personalized recommendations
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
