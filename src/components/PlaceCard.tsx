import { motion } from 'framer-motion';
import { Place, CrowdLevel, interests } from '@/data/places';
import { CrowdBadge, HiddenGemBadge } from './CrowdBadge';
import { Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaceCardProps {
  place: Place & { crowdStatus: { level: CrowdLevel; percentage: number } };
  onClick?: () => void;
  showAlternativePrompt?: boolean;
  delay?: number;
}

export function PlaceCard({ place, onClick, showAlternativePrompt, delay = 0 }: PlaceCardProps) {
  const isCrowded = place.crowdStatus.level === 'high';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer',
        isCrowded && 'ring-2 ring-red-200'
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <CrowdBadge level={place.crowdStatus.level} size="sm" />
          {place.isHiddenGem && <HiddenGemBadge size="sm" />}
        </div>

        {/* Interest tags */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {place.interests.map(interest => (
            <span
              key={interest}
              className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-foreground"
            >
              {interests[interest].icon} {interests[interest].name}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {place.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {place.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {place.visitDuration}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {place.zone.charAt(0).toUpperCase() + place.zone.slice(1)} Zone
          </span>
        </div>

        {/* Alternative prompt for crowded places */}
        {showAlternativePrompt && isCrowded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100"
          >
            <p className="text-sm text-red-700 flex items-center gap-2">
              <Users size={14} />
              Currently crowded. Tap to see peaceful alternatives!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface PlaceCardCompactProps {
  place: Place & { crowdStatus: { level: CrowdLevel; percentage: number } };
  onClick?: () => void;
  delay?: number;
}

export function PlaceCardCompact({ place, onClick, delay = 0 }: PlaceCardCompactProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ x: 4 }}
      className="flex gap-4 p-3 rounded-xl bg-card shadow-soft hover:shadow-card transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <img
        src={place.image}
        alt={place.name}
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-foreground truncate">{place.name}</h4>
          <CrowdBadge level={place.crowdStatus.level} size="sm" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>
      </div>
    </motion.div>
  );
}
