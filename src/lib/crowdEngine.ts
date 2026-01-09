import { Place, CrowdLevel, TimeOfDay, Interest, Zone, places } from '@/data/places';

// Get current time of day
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

// Determine if it's peak season (simulated)
export function isPeakSeason(): boolean {
  const month = new Date().getMonth();
  // Peak season: October to March (Dasara season and winter)
  return month >= 9 || month <= 2;
}

// Get day of week factor (weekends are busier)
function getDayFactor(): number {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? 1.3 : 1.0;
}

// Calculate real-time crowd level for a place
export function calculateCrowdLevel(place: Place): { level: CrowdLevel; percentage: number } {
  const timeOfDay = getCurrentTimeOfDay();
  const peakSeason = isPeakSeason();
  const dayFactor = getDayFactor();
  
  let crowdPercentage = place.baseCrowdLevel;
  
  // Time of day modifiers
  const timeModifiers: Record<TimeOfDay, number> = {
    morning: 0.7,
    afternoon: 1.2,
    evening: 1.0,
  };
  crowdPercentage *= timeModifiers[timeOfDay];
  
  // Best time bonus (less crowded during best times paradoxically - locals know)
  if (place.bestTime.includes(timeOfDay)) {
    crowdPercentage *= 0.85;
  }
  
  // Season modifier
  if (peakSeason) {
    crowdPercentage *= 1.4;
  }
  
  // Day of week modifier
  crowdPercentage *= dayFactor;
  
  // Add some randomness for realism (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2;
  crowdPercentage *= randomFactor;
  
  // Clamp to 0-100
  crowdPercentage = Math.min(100, Math.max(0, crowdPercentage));
  
  // Determine level
  let level: CrowdLevel;
  if (crowdPercentage < 40) {
    level = 'low';
  } else if (crowdPercentage < 70) {
    level = 'medium';
  } else {
    level = 'high';
  }
  
  return { level, percentage: Math.round(crowdPercentage) };
}

// Get all places with their current crowd levels
export function getPlacesWithCrowdLevels(): (Place & { crowdStatus: { level: CrowdLevel; percentage: number } })[] {
  return places.map(place => ({
    ...place,
    crowdStatus: calculateCrowdLevel(place),
  }));
}

// Find alternative places for a crowded location
export function findAlternatives(
  place: Place,
  userInterests: Interest[],
  maxResults: number = 3
): (Place & { crowdStatus: { level: CrowdLevel; percentage: number } })[] {
  const placesWithCrowd = getPlacesWithCrowdLevels();
  
  return placesWithCrowd
    .filter(p => {
      // Exclude the original place
      if (p.id === place.id) return false;
      
      // Must have at least one matching interest
      const hasMatchingInterest = p.interests.some(i => userInterests.includes(i));
      if (!hasMatchingInterest) return false;
      
      // Prefer less crowded places
      if (p.crowdStatus.level === 'high') return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort by crowd level (ascending) then by interest match count
      const crowdOrder = { low: 0, medium: 1, high: 2 };
      const crowdDiff = crowdOrder[a.crowdStatus.level] - crowdOrder[b.crowdStatus.level];
      if (crowdDiff !== 0) return crowdDiff;
      
      // Count interest matches
      const aMatches = a.interests.filter(i => userInterests.includes(i)).length;
      const bMatches = b.interests.filter(i => userInterests.includes(i)).length;
      return bMatches - aMatches;
    })
    .slice(0, maxResults);
}

// Get recommended places based on interests and crowd levels
export function getRecommendedPlaces(
  userInterests: Interest[],
  excludeIds: string[] = []
): (Place & { crowdStatus: { level: CrowdLevel; percentage: number } })[] {
  const placesWithCrowd = getPlacesWithCrowdLevels();
  const timeOfDay = getCurrentTimeOfDay();
  
  return placesWithCrowd
    .filter(p => {
      // Exclude specific places
      if (excludeIds.includes(p.id)) return false;
      
      // Must have at least one matching interest
      const hasMatchingInterest = p.interests.some(i => userInterests.includes(i));
      if (!hasMatchingInterest) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Primary: Prefer low crowd places
      const crowdOrder = { low: 0, medium: 1, high: 2 };
      const crowdDiff = crowdOrder[a.crowdStatus.level] - crowdOrder[b.crowdStatus.level];
      if (crowdDiff !== 0) return crowdDiff;
      
      // Secondary: Prefer places suited for current time
      const aTimeMatch = a.bestTime.includes(timeOfDay) ? 1 : 0;
      const bTimeMatch = b.bestTime.includes(timeOfDay) ? 1 : 0;
      if (bTimeMatch !== aTimeMatch) return bTimeMatch - aTimeMatch;
      
      // Tertiary: Prefer hidden gems
      if (a.isHiddenGem !== b.isHiddenGem) return a.isHiddenGem ? -1 : 1;
      
      // Finally: More interest matches
      const aMatches = a.interests.filter(i => userInterests.includes(i)).length;
      const bMatches = b.interests.filter(i => userInterests.includes(i)).length;
      return bMatches - aMatches;
    });
}

// Get hidden gems
export function getHiddenGems(
  userInterests?: Interest[]
): (Place & { crowdStatus: { level: CrowdLevel; percentage: number } })[] {
  const placesWithCrowd = getPlacesWithCrowdLevels();
  
  return placesWithCrowd
    .filter(p => {
      if (!p.isHiddenGem) return false;
      if (userInterests && userInterests.length > 0) {
        return p.interests.some(i => userInterests.includes(i));
      }
      return true;
    })
    .sort((a, b) => a.crowdStatus.percentage - b.crowdStatus.percentage);
}

// Get places by zone
export function getPlacesByZone(
  zone: Zone
): (Place & { crowdStatus: { level: CrowdLevel; percentage: number } })[] {
  const placesWithCrowd = getPlacesWithCrowdLevels();
  return placesWithCrowd.filter(p => p.zone === zone);
}

// Time-based recommendations
export function getTimeBasedRecommendations(
  userInterests: Interest[]
): { message: string; places: (Place & { crowdStatus: { level: CrowdLevel; percentage: number } })[] } {
  const timeOfDay = getCurrentTimeOfDay();
  const placesWithCrowd = getPlacesWithCrowdLevels();
  
  const messages: Record<TimeOfDay, string> = {
    morning: 'Perfect time for outdoor exploration and open-air monuments',
    afternoon: 'Great for indoor attractions like museums and galleries',
    evening: 'Ideal for lakes, cultural walks, and evening performances',
  };
  
  const filtered = placesWithCrowd
    .filter(p => {
      const hasInterest = userInterests.length === 0 || p.interests.some(i => userInterests.includes(i));
      const isGoodTime = p.bestTime.includes(timeOfDay);
      return hasInterest && isGoodTime && p.crowdStatus.level !== 'high';
    })
    .slice(0, 4);
  
  return {
    message: messages[timeOfDay],
    places: filtered,
  };
}
