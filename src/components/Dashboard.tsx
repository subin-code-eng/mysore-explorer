import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourism } from '@/contexts/TourismContext';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { PlaceCard } from './PlaceCard';
import { PlaceDetailModal } from './PlaceDetailModal';
import { ZoneExplorer } from './ZoneExplorer';
import { HiddenGemsSection } from './HiddenGemsSection';
import { TimeBasedSection } from './TimeBasedSection';
import { SustainabilitySection } from './SustainabilitySection';
import { getRecommendedPlaces, getPlacesByZone } from '@/lib/crowdEngine';
import { Place, CrowdLevel, Zone, interests } from '@/data/places';
import { Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardProps {
  onResetInterests: () => void;
}

type SortOption = 'crowd' | 'recommended' | 'popular';

export function Dashboard({ onResetInterests }: DashboardProps) {
  const { selectedInterests } = useTourism();
  const [selectedPlace, setSelectedPlace] = useState<(Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showFilters, setShowFilters] = useState(false);

  const recommendedPlaces = useMemo(() => {
    if (selectedZone) {
      return getPlacesByZone(selectedZone);
    }
    return getRecommendedPlaces(selectedInterests);
  }, [selectedInterests, selectedZone]);

  const sortedPlaces = useMemo(() => {
    const places = [...recommendedPlaces];
    switch (sortBy) {
      case 'crowd':
        return places.sort((a, b) => a.crowdStatus.percentage - b.crowdStatus.percentage);
      case 'popular':
        return places.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      default:
        return places; // Already sorted by recommendation algorithm
    }
  }, [recommendedPlaces, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header onResetInterests={onResetInterests} />

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <HeroSection />

        {/* Time-based recommendations */}
        <TimeBasedSection onSelectPlace={setSelectedPlace} />

        {/* Zone Explorer */}
        <ZoneExplorer 
          selectedZone={selectedZone}
          onSelectZone={(zone) => setSelectedZone(selectedZone === zone ? null : zone)}
        />

        {/* Main Places Section */}
        <section className="py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {selectedZone 
                  ? `Explore ${selectedZone.charAt(0).toUpperCase() + selectedZone.slice(1)} Zone`
                  : 'Recommended for You'
                }
              </h2>
              <p className="text-muted-foreground">
                {selectedZone 
                  ? `${sortedPlaces.length} places to discover`
                  : `Based on your interests: ${selectedInterests.map(i => interests[i].name).join(', ')}`
                }
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  showFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                )}
              >
                <Filter size={16} />
                <span>Filters</span>
                <ChevronDown size={16} className={cn('transition-transform', showFilters && 'rotate-180')} />
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
              >
                <option value="recommended">Recommended</option>
                <option value="crowd">Least Crowded</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-muted/50 border border-border"
              >
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="text-sm font-medium text-foreground mb-2 block">Crowd Level</span>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(level => (
                        <button
                          key={level}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
                            level === 'low' && 'bg-green-100 text-green-700',
                            level === 'medium' && 'bg-yellow-100 text-yellow-700',
                            level === 'high' && 'bg-red-100 text-red-700'
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedZone && (
                    <button
                      onClick={() => setSelectedZone(null)}
                      className="self-end px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
                    >
                      Clear Zone Filter
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Places Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPlaces.map((place, index) => (
              <PlaceCard
                key={place.id}
                place={place}
                onClick={() => setSelectedPlace(place)}
                showAlternativePrompt
                delay={index * 0.05}
              />
            ))}
          </div>

          {sortedPlaces.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No places found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* Hidden Gems */}
        {!selectedZone && (
          <HiddenGemsSection onSelectPlace={setSelectedPlace} />
        )}

        {/* Sustainability Section */}
        <SustainabilitySection />

        {/* Footer */}
        <footer className="py-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            Decentralised Tourism Mysore • Promoting sustainable travel across the royal city
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Built for academic evaluation and demo purposes
          </p>
        </footer>
      </main>

      {/* Place Detail Modal */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailModal
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onSelectPlace={setSelectedPlace}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
