import { motion } from 'framer-motion';
import { getHiddenGems } from '@/lib/crowdEngine';
import { useTourism } from '@/contexts/TourismContext';
import { PlaceCard } from './PlaceCard';
import { Place, CrowdLevel } from '@/data/places';
import { Sparkles } from 'lucide-react';

interface HiddenGemsSectionProps {
  onSelectPlace: (place: Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) => void;
}

export function HiddenGemsSection({ onSelectPlace }: HiddenGemsSectionProps) {
  const { selectedInterests } = useTourism();
  const hiddenGems = getHiddenGems(selectedInterests).slice(0, 4);

  if (hiddenGems.length === 0) return null;

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles size={18} />
          <span className="font-medium">Underrated Hidden Gems</span>
        </div>
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          Discover What Others Miss
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          These lesser-known locations offer authentic experiences without the crowds. 
          Each place is special in its own way.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hiddenGems.map((place, index) => (
          <PlaceCard
            key={place.id}
            place={place}
            onClick={() => onSelectPlace(place)}
            delay={index * 0.1}
          />
        ))}
      </div>
    </section>
  );
}
