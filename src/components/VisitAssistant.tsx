import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, Sparkles, TrendingDown, Clock, Info } from 'lucide-react';
import { Place, CrowdLevel, Zone, zones } from '@/data/places';
import { useTourism } from '@/contexts/TourismContext';
import { getRecommendedPlaces, getCurrentTimeOfDay, getPlacesByZone } from '@/lib/crowdEngine';
import { UserLocation, formatDistance, calculateDistance } from '@/lib/geoUtils';
import { CrowdBadge } from './CrowdBadge';

interface VisitAssistantProps {
  userLocation: UserLocation | null;
  onSelectPlace: (place: Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) => void;
}

export function VisitAssistant({ userLocation, onSelectPlace }: VisitAssistantProps) {
  const { selectedInterests } = useTourism();
  const timeOfDay = getCurrentTimeOfDay();

  const recommendations = useMemo(() => {
    const allPlaces = getRecommendedPlaces(selectedInterests);
    
    // Sort by crowd level first (low priority), then by distance if location available
    let sorted = [...allPlaces].sort((a, b) => {
      const crowdOrder = { low: 0, medium: 1, high: 2 };
      const crowdDiff = crowdOrder[a.crowdStatus.level] - crowdOrder[b.crowdStatus.level];
      if (crowdDiff !== 0) return crowdDiff;
      
      if (userLocation) {
        const distA = calculateDistance(userLocation, a.coordinates);
        const distB = calculateDistance(userLocation, b.coordinates);
        return distA - distB;
      }
      return 0;
    });

    // Add distance info if location available
    if (userLocation) {
      sorted = sorted.map(p => ({
        ...p,
        distance: calculateDistance(userLocation, p.coordinates),
      }));
    }

    return sorted;
  }, [selectedInterests, userLocation]);

  const suggestedNext = recommendations[0];
  const nearbyLowCrowd = recommendations.find(p => 
    p.crowdStatus.level === 'low' && 
    (userLocation ? calculateDistance(userLocation, p.coordinates) <= 3 : true)
  );

  // Find best zone to explore
  const bestZone = useMemo(() => {
    const zoneScores: { zone: Zone; score: number; lowCrowdCount: number }[] = [];
    
    (['central', 'outer', 'nature', 'spiritual'] as Zone[]).forEach(zone => {
      const zonePlaces = getPlacesByZone(zone);
      const lowCrowdCount = zonePlaces.filter(p => p.crowdStatus.level === 'low').length;
      const avgCrowd = zonePlaces.reduce((sum, p) => sum + p.crowdStatus.percentage, 0) / zonePlaces.length;
      zoneScores.push({
        zone,
        score: (100 - avgCrowd) + (lowCrowdCount * 10),
        lowCrowdCount,
      });
    });

    return zoneScores.sort((a, b) => b.score - a.score)[0];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Compass className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">Real-Time Visit Assistant</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info size={12} />
              This is a real-time visit assistant, not a trip planner.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Suggested Next Place */}
        {suggestedNext && (
          <div 
            className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectPlace(suggestedNext)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sparkles className="text-green-600" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Suggested Next</p>
                <p className="font-semibold text-foreground">{suggestedNext.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CrowdBadge level={suggestedNext.crowdStatus.level} size="sm" />
                  {userLocation && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(calculateDistance(userLocation, suggestedNext.coordinates))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nearby Low-Crowd Stop */}
        {nearbyLowCrowd && nearbyLowCrowd.id !== suggestedNext?.id && (
          <div 
            className="p-3 rounded-xl bg-muted/50 border border-border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectPlace(nearbyLowCrowd)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <TrendingDown className="text-secondary" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-secondary uppercase tracking-wide">Nearby Low-Crowd Stop</p>
                <p className="font-semibold text-foreground">{nearbyLowCrowd.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CrowdBadge level={nearbyLowCrowd.crowdStatus.level} size="sm" />
                  {userLocation && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(calculateDistance(userLocation, nearbyLowCrowd.coordinates))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Best Zone to Explore */}
        {bestZone && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MapPin className="text-primary" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">Best Zone Right Now</p>
                <p className="font-semibold text-foreground">{zones[bestZone.zone].name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bestZone.lowCrowdCount} places with low crowds
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Time-based tip */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-sm">
          <Clock size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground">
            {timeOfDay === 'morning' && 'Morning: Best for outdoor sites & temples'}
            {timeOfDay === 'afternoon' && 'Afternoon: Great for museums & galleries'}
            {timeOfDay === 'evening' && 'Evening: Perfect for lakes & cultural walks'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
