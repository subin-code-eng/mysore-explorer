import { useState, useMemo, useEffect } from 'react';
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
import { MapView } from './MapView';
import { VisitAssistant } from './VisitAssistant';
import { RadiusDiscovery } from './RadiusDiscovery';
import { LocalExperiences } from './LocalExperiences';
import { DecentralisationScore } from './DecentralisationScore';
import { CrowdFilter } from './CrowdFilter';
import { getRecommendedPlaces, getPlacesByZone } from '@/lib/crowdEngine';
import { getUserLocation, MYSORE_CENTER, UserLocation } from '@/lib/geoUtils';
import { Place, CrowdLevel, Zone, interests } from '@/data/places';
import { Filter, ChevronDown, Map, List, Navigation, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardProps {
  onResetInterests: () => void;
}

type SortOption = 'crowd' | 'recommended' | 'popular';
type ViewMode = 'list' | 'map';

export function Dashboard({ onResetInterests }: DashboardProps) {
  const { selectedInterests } = useTourism();
  const [selectedPlace, setSelectedPlace] = useState<(Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [crowdFilter, setCrowdFilter] = useState<CrowdLevel[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Get user location on mount
  useEffect(() => {
    setIsLocating(true);
    getUserLocation()
      .then(setUserLocation)
      .finally(() => setIsLocating(false));
  }, []);

  const recommendedPlaces = useMemo(() => {
    if (selectedZone) {
      return getPlacesByZone(selectedZone);
    }
    return getRecommendedPlaces(selectedInterests);
  }, [selectedInterests, selectedZone]);

  const filteredAndSortedPlaces = useMemo(() => {
    let places = [...recommendedPlaces];
    
    // Apply crowd filter
    if (crowdFilter.length > 0) {
      places = places.filter(p => crowdFilter.includes(p.crowdStatus.level));
    }

    // Sort
    switch (sortBy) {
      case 'crowd':
        return places.sort((a, b) => a.crowdStatus.percentage - b.crowdStatus.percentage);
      case 'popular':
        return places.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      default:
        return places;
    }
  }, [recommendedPlaces, sortBy, crowdFilter]);

  const handleMapView = () => {
    if (!mapboxToken) {
      setShowTokenInput(true);
    } else {
      setViewMode('map');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onResetInterests={onResetInterests} />

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <HeroSection />

        {/* Mapbox Token Input Modal */}
        <AnimatePresence>
          {showTokenInput && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowTokenInput(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card rounded-xl p-6 max-w-md w-full shadow-elevated"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl font-bold">Enable Map View</h3>
                  <button onClick={() => setShowTokenInput(false)}>
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your Mapbox public token to enable interactive maps. Get one free at{' '}
                  <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    mapbox.com
                  </a>
                </p>
                <input
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={mapboxToken}
                  onChange={e => setMapboxToken(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg mb-4"
                />
                <button
                  onClick={() => {
                    if (mapboxToken) {
                      setShowTokenInput(false);
                      setViewMode('map');
                    }
                  }}
                  disabled={!mapboxToken}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                >
                  Enable Maps
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6 py-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <VisitAssistant userLocation={userLocation} onSelectPlace={setSelectedPlace} />
            <DecentralisationScore />
            <RadiusDiscovery userLocation={userLocation} onSelectPlace={setSelectedPlace} />
            <LocalExperiences userLocation={userLocation} currentZone={selectedZone || undefined} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            <TimeBasedSection onSelectPlace={setSelectedPlace} />
            <ZoneExplorer 
              selectedZone={selectedZone}
              onSelectZone={(zone) => setSelectedZone(selectedZone === zone ? null : zone)}
            />

            {/* Main Places Section */}
            <section className="py-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    {selectedZone ? `Explore ${selectedZone.charAt(0).toUpperCase() + selectedZone.slice(1)} Zone` : 'Recommended for You'}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedZone ? `${filteredAndSortedPlaces.length} places` : `Based on: ${selectedInterests.map(i => interests[i].name).join(', ')}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn('px-3 py-2', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
                    >
                      <List size={18} />
                    </button>
                    <button
                      onClick={handleMapView}
                      className={cn('px-3 py-2', viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
                    >
                      <Map size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                      showFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                    )}
                  >
                    <Filter size={16} />
                    <span>Filters</span>
                    {crowdFilter.length > 0 && <span className="bg-white/20 px-1.5 rounded text-xs">{crowdFilter.length}</span>}
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
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-sm font-medium text-foreground mb-2 block">Crowd Level</span>
                        <CrowdFilter selectedLevels={crowdFilter} onChange={setCrowdFilter} />
                      </div>
                      {(selectedZone || crowdFilter.length > 0) && (
                        <button
                          onClick={() => { setSelectedZone(null); setCrowdFilter([]); }}
                          className="self-end px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Map View */}
              {viewMode === 'map' && mapboxToken ? (
                <div className="h-[500px] rounded-xl overflow-hidden border border-border">
                  <MapView
                    places={filteredAndSortedPlaces}
                    userLocation={userLocation}
                    onSelectPlace={setSelectedPlace}
                    selectedPlace={selectedPlace}
                    showRoute={!!selectedPlace}
                    onClose={() => setViewMode('list')}
                    mapboxToken={mapboxToken}
                  />
                </div>
              ) : (
                /* Places Grid */
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredAndSortedPlaces.map((place, index) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onClick={() => setSelectedPlace(place)}
                      showAlternativePrompt
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              )}

              {filteredAndSortedPlaces.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No places found matching your criteria.</p>
                  <button onClick={() => setCrowdFilter([])} className="mt-2 text-primary underline">Clear filters</button>
                </div>
              )}
            </section>

            {!selectedZone && <HiddenGemsSection onSelectPlace={setSelectedPlace} />}
            <SustainabilitySection />
          </div>
        </div>

        <footer className="py-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            Decentralised Tourism Mysore • Promoting sustainable travel across the royal city
          </p>
        </footer>
      </main>

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
