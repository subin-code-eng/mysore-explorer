import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Navigation } from 'lucide-react';
import { Place, CrowdLevel } from '@/data/places';
import { UserLocation, groupPlacesByDistance, formatDistance } from '@/lib/geoUtils';
import { getPlacesWithCrowdLevels } from '@/lib/crowdEngine';
import { useTourism } from '@/contexts/TourismContext';
import { CrowdBadge } from './CrowdBadge';
import { cn } from '@/lib/utils';

interface RadiusDiscoveryProps {
  userLocation: UserLocation | null;
  onSelectPlace: (place: Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) => void;
}

export function RadiusDiscovery({ userLocation, onSelectPlace }: RadiusDiscoveryProps) {
  const { selectedInterests } = useTourism();
  const [expandedSection, setExpandedSection] = useState<string | null>('within1km');

  const groupedPlaces = useMemo(() => {
    if (!userLocation) return null;

    const allPlaces = getPlacesWithCrowdLevels();
    
    // Filter by interests
    const filtered = allPlaces.filter(p => 
      selectedInterests.length === 0 || 
      p.interests.some(i => selectedInterests.includes(i))
    );

    const grouped = groupPlacesByDistance(filtered, userLocation);

    // Sort each group by crowd level (low first)
    const crowdOrder = { low: 0, medium: 1, high: 2 };
    Object.keys(grouped).forEach(key => {
      grouped[key as keyof typeof grouped].sort((a, b) => 
        crowdOrder[a.crowdStatus.level] - crowdOrder[b.crowdStatus.level]
      );
    });

    return grouped;
  }, [userLocation, selectedInterests]);

  if (!userLocation) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <Navigation className="mx-auto text-muted-foreground mb-3" size={32} />
        <p className="text-muted-foreground">Enable location to see places near you</p>
      </div>
    );
  }

  const sections = [
    { key: 'within1km', label: 'Within 1 km', places: groupedPlaces?.within1km || [] },
    { key: 'within2km', label: 'Within 2 km', places: groupedPlaces?.within2km || [] },
    { key: 'within5km', label: 'Within 5 km', places: groupedPlaces?.within5km || [] },
    { key: 'beyond5km', label: 'Beyond 5 km', places: groupedPlaces?.beyond5km || [] },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="text-primary" size={20} />
        <h3 className="font-serif text-lg font-bold text-foreground">Discover by Distance</h3>
      </div>

      {sections.map(section => (
        <div key={section.key} className="bg-card rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-foreground">{section.label}</span>
              <span className="text-sm text-muted-foreground">
                {section.places.length} place{section.places.length !== 1 ? 's' : ''}
              </span>
              {section.places.filter(p => p.crowdStatus.level === 'low').length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  {section.places.filter(p => p.crowdStatus.level === 'low').length} low crowd
                </span>
              )}
            </div>
            <ChevronDown 
              size={20} 
              className={cn(
                'text-muted-foreground transition-transform',
                expandedSection === section.key && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {expandedSection === section.key && section.places.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {section.places.map(place => (
                    <div
                      key={place.id}
                      onClick={() => onSelectPlace(place)}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{place.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistance(place.distance)}
                          </span>
                          {place.isHiddenGem && (
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Hidden Gem
                            </span>
                          )}
                        </div>
                      </div>
                      <CrowdBadge level={place.crowdStatus.level} size="sm" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {expandedSection === section.key && section.places.length === 0 && (
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              No places in this radius matching your interests
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
