import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Navigation, Star, Users, ChevronRight, Palette } from 'lucide-react';
import { Place, CrowdLevel, interests, artisans } from '@/data/places';
import { CrowdBadge, HiddenGemBadge } from './CrowdBadge';
import { PlaceCardCompact } from './PlaceCard';
import { findAlternatives } from '@/lib/crowdEngine';
import { useTourism } from '@/contexts/TourismContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PlaceDetailModalProps {
  place: (Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) | null;
  onClose: () => void;
  onSelectPlace: (place: Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) => void;
}

export function PlaceDetailModal({ place, onClose, onSelectPlace }: PlaceDetailModalProps) {
  const { selectedInterests, submitFeedback, feedbackData, markVisited } = useTourism();
  const [showFeedback, setShowFeedback] = useState(false);
  const [crowdRating, setCrowdRating] = useState<number>(3);
  const [recommend, setRecommend] = useState<boolean | null>(null);

  if (!place) return null;

  const alternatives = place.crowdStatus.level === 'high' 
    ? findAlternatives(place, selectedInterests) 
    : [];

  const nearbyArtisansList = artisans.filter(a => 
    a.nearbyPlaces.includes(place.id)
  );

  const hasFeedback = feedbackData[place.id];

  const handleSubmitFeedback = () => {
    if (recommend !== null) {
      submitFeedback(place.id, crowdRating, recommend);
      markVisited(place.id);
      setShowFeedback(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-t-3xl md:rounded-3xl shadow-elevated"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-64">
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <CrowdBadge level={place.crowdStatus.level} showPercentage />
                {place.isHiddenGem && <HiddenGemBadge />}
              </div>
              <h2 className="font-serif text-3xl font-bold text-white drop-shadow-lg">
                {place.name}
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Crowded Alert */}
            {place.crowdStatus.level === 'high' && alternatives.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100"
              >
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Users size={18} />
                  This place is crowded right now
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Consider these peaceful alternatives with similar experiences:
                </p>
                <div className="space-y-2">
                  {alternatives.map((alt, i) => (
                    <PlaceCardCompact
                      key={alt.id}
                      place={alt}
                      onClick={() => onSelectPlace(alt)}
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {place.longDescription}
              </p>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock size={16} />
                  <span className="text-sm">Visit Duration</span>
                </div>
                <p className="font-semibold">{place.visitDuration}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin size={16} />
                  <span className="text-sm">Zone</span>
                </div>
                <p className="font-semibold capitalize">{place.zone} Zone</p>
              </div>
            </div>

            {/* Best Time to Visit */}
            <div className="p-4 rounded-xl bg-secondary/20 border border-secondary/30">
              <h3 className="font-semibold text-secondary mb-2">Best Time to Visit</h3>
              <div className="flex gap-2">
                {place.bestTime.map(time => (
                  <span
                    key={time}
                    className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium capitalize"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {place.interests.map(interest => (
                  <span
                    key={interest}
                    className="px-4 py-2 rounded-full bg-muted text-foreground font-medium"
                  >
                    {interests[interest].icon} {interests[interest].name}
                  </span>
                ))}
              </div>
            </div>

            {/* Nearby Artisans */}
            {nearbyArtisansList.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Palette size={18} className="text-primary" />
                  Support Local Artisans Nearby
                </h3>
                <div className="space-y-3">
                  {nearbyArtisansList.map(artisan => (
                    <div
                      key={artisan.id}
                      className="p-4 rounded-xl bg-primary/5 border border-primary/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{artisan.name}</h4>
                          <p className="text-sm text-primary font-medium">{artisan.craft}</p>
                        </div>
                        <ChevronRight size={20} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{artisan.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">📍 {artisan.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Suggestion */}
            <button className="w-full p-4 rounded-xl bg-gradient-accent text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Navigation size={18} />
              Get Directions
            </button>

            {/* Feedback Section */}
            {!hasFeedback ? (
              <div className="border-t pt-6">
                {!showFeedback ? (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    Visited this place? Share your feedback!
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold">How was your visit?</h3>
                    
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        How crowded was it? (1 = Empty, 5 = Very Crowded)
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onClick={() => setCrowdRating(n)}
                            className={cn(
                              'w-12 h-12 rounded-lg border-2 font-semibold transition-all',
                              crowdRating === n
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-muted hover:border-primary'
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Would you recommend this place?
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setRecommend(true)}
                          className={cn(
                            'flex-1 p-3 rounded-lg border-2 font-medium transition-all',
                            recommend === true
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'border-muted hover:border-green-300'
                          )}
                        >
                          👍 Yes!
                        </button>
                        <button
                          onClick={() => setRecommend(false)}
                          className={cn(
                            'flex-1 p-3 rounded-lg border-2 font-medium transition-all',
                            recommend === false
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : 'border-muted hover:border-red-300'
                          )}
                        >
                          👎 Not really
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitFeedback}
                      disabled={recommend === null}
                      className="w-full p-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Feedback
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-800">Thanks for your feedback!</p>
                <p className="text-sm text-green-600">Your input helps other travelers.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
