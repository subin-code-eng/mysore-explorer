import { motion } from 'framer-motion';
import { zones, Zone } from '@/data/places';
import { getPlacesByZone } from '@/lib/crowdEngine';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZoneExplorerProps {
  onSelectZone: (zone: Zone) => void;
  selectedZone: Zone | null;
}

const zoneIcons: Record<Zone, string> = {
  central: '🏛️',
  outer: '🎭',
  nature: '🌿',
  spiritual: '🕉️',
};

const zoneGradients: Record<Zone, string> = {
  central: 'from-amber-500 to-orange-600',
  outer: 'from-purple-500 to-indigo-600',
  nature: 'from-emerald-500 to-teal-600',
  spiritual: 'from-orange-500 to-red-500',
};

export function ZoneExplorer({ onSelectZone, selectedZone }: ZoneExplorerProps) {
  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          Explore by Zone
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Mysore is divided into distinct zones. Explore beyond the city center to discover hidden treasures.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(zones) as Zone[]).map((zoneKey, index) => {
          const zone = zones[zoneKey];
          const placesInZone = getPlacesByZone(zoneKey);
          const lowCrowdCount = placesInZone.filter(p => p.crowdStatus.level === 'low').length;
          const isSelected = selectedZone === zoneKey;

          return (
            <motion.button
              key={zoneKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectZone(zoneKey)}
              className={cn(
                'relative p-6 rounded-2xl text-left transition-all duration-300 overflow-hidden group',
                isSelected
                  ? 'ring-2 ring-primary shadow-elevated'
                  : 'shadow-card hover:shadow-elevated'
              )}
            >
              {/* Background gradient */}
              <div
                className={cn(
                  'absolute inset-0 opacity-10 transition-opacity duration-300',
                  `bg-gradient-to-br ${zoneGradients[zoneKey]}`,
                  'group-hover:opacity-20'
                )}
              />

              <div className="relative z-10">
                <span className="text-4xl mb-3 block">{zoneIcons[zoneKey]}</span>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                  {zone.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {zone.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin size={14} />
                    {placesInZone.length} places
                  </span>
                  {lowCrowdCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {lowCrowdCount} peaceful
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="zone-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
