import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Leaf, Heart } from 'lucide-react';
import { useTourism } from '@/contexts/TourismContext';
import { places } from '@/data/places';

export function DecentralisationScore() {
  const { visitedPlaces, feedbackData } = useTourism();

  const score = useMemo(() => {
    let points = 0;
    let maxPoints = 0;

    visitedPlaces.forEach(placeId => {
      const place = places.find(p => p.id === placeId);
      if (!place) return;

      maxPoints += 30;

      // Points for visiting low-crowd places
      if (place.baseCrowdLevel < 40) points += 15;
      else if (place.baseCrowdLevel < 70) points += 10;
      else points += 5;

      // Points for visiting outer zones
      if (place.zone !== 'central') points += 10;
      else points += 3;

      // Points for hidden gems
      if (place.isHiddenGem) points += 5;
    });

    // Bonus for positive feedback
    Object.values(feedbackData).forEach(feedback => {
      if (feedback.recommend) points += 5;
    });

    return {
      current: points,
      max: Math.max(maxPoints, 100),
      percentage: maxPoints > 0 ? Math.min(100, Math.round((points / maxPoints) * 100)) : 0,
    };
  }, [visitedPlaces, feedbackData]);

  const messages = useMemo(() => {
    const msgs = [];
    
    if (visitedPlaces.length === 0) {
      msgs.push({
        icon: Heart,
        text: 'Start exploring to build your sustainability score!',
        color: 'text-muted-foreground',
      });
    } else {
      if (score.percentage >= 70) {
        msgs.push({
          icon: Award,
          text: 'You are a sustainable tourism champion!',
          color: 'text-green-600',
        });
      }

      const outerZoneVisits = visitedPlaces.filter(id => {
        const place = places.find(p => p.id === id);
        return place && place.zone !== 'central';
      }).length;

      if (outerZoneVisits > 0) {
        msgs.push({
          icon: TrendingUp,
          text: 'You are helping reduce crowding by visiting low-density zones.',
          color: 'text-secondary',
        });
      }

      const hiddenGemVisits = visitedPlaces.filter(id => {
        const place = places.find(p => p.id === id);
        return place?.isHiddenGem;
      }).length;

      if (hiddenGemVisits > 0) {
        msgs.push({
          icon: Leaf,
          text: 'Your choices support sustainable tourism.',
          color: 'text-green-600',
        });
      }
    }

    return msgs;
  }, [visitedPlaces, score.percentage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-200 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="text-green-600" size={20} />
          <h4 className="font-serif font-bold text-foreground">Decentralisation Score</h4>
        </div>
        <span className="text-2xl font-bold text-green-600">{score.percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-green-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="p-2 bg-white/50 rounded-lg">
          <p className="text-lg font-bold text-foreground">{visitedPlaces.length}</p>
          <p className="text-xs text-muted-foreground">Places Visited</p>
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          <p className="text-lg font-bold text-foreground">
            {visitedPlaces.filter(id => places.find(p => p.id === id)?.zone !== 'central').length}
          </p>
          <p className="text-xs text-muted-foreground">Outer Zones</p>
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          <p className="text-lg font-bold text-foreground">
            {visitedPlaces.filter(id => places.find(p => p.id === id)?.isHiddenGem).length}
          </p>
          <p className="text-xs text-muted-foreground">Hidden Gems</p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {messages.map((msg, idx) => {
          const IconComponent = msg.icon;
          return (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <IconComponent size={14} className={msg.color} />
              <span className={msg.color}>{msg.text}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
