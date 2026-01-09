import { motion } from 'framer-motion';
import { getTimeBasedRecommendations, getCurrentTimeOfDay } from '@/lib/crowdEngine';
import { useTourism } from '@/contexts/TourismContext';
import { PlaceCardCompact } from './PlaceCard';
import { Place, CrowdLevel } from '@/data/places';
import { Sun, Sunset, Moon, Clock } from 'lucide-react';

interface TimeBasedSectionProps {
  onSelectPlace: (place: Place & { crowdStatus: { level: CrowdLevel; percentage: number } }) => void;
}

const timeIcons = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
};

const timeColors = {
  morning: 'from-amber-400 to-orange-500',
  afternoon: 'from-orange-400 to-red-500',
  evening: 'from-indigo-500 to-purple-600',
};

export function TimeBasedSection({ onSelectPlace }: TimeBasedSectionProps) {
  const { selectedInterests } = useTourism();
  const timeOfDay = getCurrentTimeOfDay();
  const { message, places } = getTimeBasedRecommendations(selectedInterests);
  const TimeIcon = timeIcons[timeOfDay];

  if (places.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8"
    >
      <div className={`relative p-6 rounded-2xl bg-gradient-to-r ${timeColors[timeOfDay]} overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/20">
              <TimeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white capitalize">
                {timeOfDay} Recommendations
              </h3>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <Clock size={14} />
                {message}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {places.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/95 rounded-xl overflow-hidden"
              >
                <PlaceCardCompact
                  place={place}
                  onClick={() => onSelectPlace(place)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
