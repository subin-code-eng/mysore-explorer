import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Palette, Store, Music, Utensils, MapPin } from 'lucide-react';
import { artisans, Place } from '@/data/places';
import { UserLocation, calculateDistance, formatDistance } from '@/lib/geoUtils';

interface LocalExperiencesProps {
  selectedPlace?: Place | null;
  userLocation?: UserLocation | null;
  currentZone?: string;
}

// Curated local experiences data
const localExperiences = [
  {
    id: 'silk-cluster',
    name: 'Mysore Silk Weaving Cluster',
    type: 'handicraft',
    description: 'Traditional handloom silk sarees with gold zari work',
    location: 'Ashoka Road',
    coordinates: { lat: 12.3065, lng: 76.6540 },
    icon: Palette,
    nearbyPlaces: ['mysore-palace', 'jaganmohan-palace'],
    zone: 'central',
  },
  {
    id: 'sandalwood-craft',
    name: 'Sandalwood Carving Artisans',
    type: 'handicraft',
    description: 'Intricate carvings and traditional crafts',
    location: 'Sayaji Rao Road',
    coordinates: { lat: 12.3080, lng: 76.6555 },
    icon: Store,
    nearbyPlaces: ['mysore-palace'],
    zone: 'central',
  },
  {
    id: 'folk-art',
    name: 'Folk Art & Performance Hub',
    type: 'performance',
    description: 'Traditional Yakshagana and folk performances',
    location: 'Jaganmohan Palace Area',
    coordinates: { lat: 12.3090, lng: 76.6510 },
    icon: Music,
    nearbyPlaces: ['jaganmohan-palace', 'folklore-museum'],
    zone: 'central',
  },
  {
    id: 'devaraja-food',
    name: 'Traditional Food Street',
    type: 'food',
    description: 'Mysore Pak, Dosa, and authentic Karnataka cuisine',
    location: 'Devaraja Market',
    coordinates: { lat: 12.3097, lng: 76.6565 },
    icon: Utensils,
    nearbyPlaces: ['devaraja-market'],
    zone: 'central',
  },
  {
    id: 'channapatna-toys',
    name: 'Channapatna Toy Makers',
    type: 'handicraft',
    description: 'GI-tagged colorful lacquerware wooden toys',
    location: 'Near Folklore Museum',
    coordinates: { lat: 12.2980, lng: 76.6400 },
    icon: Store,
    nearbyPlaces: ['folklore-museum'],
    zone: 'outer',
  },
  {
    id: 'incense-cluster',
    name: 'Incense & Agarbathi Makers',
    type: 'handicraft',
    description: 'Traditional incense sticks with natural ingredients',
    location: 'Chamundi Hills Base',
    coordinates: { lat: 12.2800, lng: 76.6680 },
    icon: Palette,
    nearbyPlaces: ['chamundi-hills'],
    zone: 'spiritual',
  },
];

const typeColors = {
  handicraft: 'bg-purple-100 text-purple-700',
  performance: 'bg-pink-100 text-pink-700',
  food: 'bg-orange-100 text-orange-700',
};

export function LocalExperiences({ selectedPlace, userLocation, currentZone }: LocalExperiencesProps) {
  const filteredExperiences = useMemo(() => {
    let experiences = [...localExperiences];

    // Filter by selected place
    if (selectedPlace) {
      experiences = experiences.filter(exp => 
        exp.nearbyPlaces.includes(selectedPlace.id)
      );
    }
    // Or filter by zone
    else if (currentZone) {
      experiences = experiences.filter(exp => exp.zone === currentZone);
    }
    // Or filter by user location (within 2km)
    else if (userLocation) {
      experiences = experiences.filter(exp => 
        calculateDistance(userLocation, exp.coordinates) <= 2
      );
    }

    // Add distance info if location available
    if (userLocation) {
      experiences = experiences.map(exp => ({
        ...exp,
        distance: calculateDistance(userLocation, exp.coordinates),
      }));
    }

    return experiences;
  }, [selectedPlace, userLocation, currentZone]);

  if (filteredExperiences.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Store className="text-amber-600" size={18} />
        <h4 className="font-serif font-bold text-foreground">Curated Local Experiences</h4>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Discover authentic local culture, handicrafts, and traditions nearby
      </p>

      <div className="space-y-2">
        {filteredExperiences.slice(0, 4).map(experience => {
          const IconComponent = experience.icon;
          return (
            <div
              key={experience.id}
              className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-amber-100"
            >
              <div className="p-2 bg-amber-100 rounded-lg">
                <IconComponent className="text-amber-600" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-sm truncate">{experience.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeColors[experience.type as keyof typeof typeColors]}`}>
                    {experience.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{experience.description}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin size={10} />
                  <span>{experience.location}</span>
                  {(experience as any).distance && (
                    <span className="ml-1">• {formatDistance((experience as any).distance)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
