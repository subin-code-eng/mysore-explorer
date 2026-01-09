import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Interest, Place, Zone } from '@/data/places';

interface TourismState {
  selectedInterests: Interest[];
  hasSelectedInterests: boolean;
  currentPlace: Place | null;
  visitedPlaces: string[];
  feedbackData: Record<string, { crowdRating: number; recommend: boolean }>;
}

interface TourismContextType extends TourismState {
  setInterests: (interests: Interest[]) => void;
  toggleInterest: (interest: Interest) => void;
  selectPlace: (place: Place | null) => void;
  markVisited: (placeId: string) => void;
  submitFeedback: (placeId: string, crowdRating: number, recommend: boolean) => void;
  resetInterests: () => void;
}

const TourismContext = createContext<TourismContextType | undefined>(undefined);

export function TourismProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TourismState>({
    selectedInterests: [],
    hasSelectedInterests: false,
    currentPlace: null,
    visitedPlaces: [],
    feedbackData: {},
  });

  const setInterests = useCallback((interests: Interest[]) => {
    setState(prev => ({
      ...prev,
      selectedInterests: interests,
      hasSelectedInterests: interests.length > 0,
    }));
  }, []);

  const toggleInterest = useCallback((interest: Interest) => {
    setState(prev => {
      const newInterests = prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter(i => i !== interest)
        : [...prev.selectedInterests, interest];
      return {
        ...prev,
        selectedInterests: newInterests,
        hasSelectedInterests: newInterests.length > 0,
      };
    });
  }, []);

  const selectPlace = useCallback((place: Place | null) => {
    setState(prev => ({ ...prev, currentPlace: place }));
  }, []);

  const markVisited = useCallback((placeId: string) => {
    setState(prev => ({
      ...prev,
      visitedPlaces: [...new Set([...prev.visitedPlaces, placeId])],
    }));
  }, []);

  const submitFeedback = useCallback((placeId: string, crowdRating: number, recommend: boolean) => {
    setState(prev => ({
      ...prev,
      feedbackData: {
        ...prev.feedbackData,
        [placeId]: { crowdRating, recommend },
      },
    }));
  }, []);

  const resetInterests = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedInterests: [],
      hasSelectedInterests: false,
    }));
  }, []);

  return (
    <TourismContext.Provider
      value={{
        ...state,
        setInterests,
        toggleInterest,
        selectPlace,
        markVisited,
        submitFeedback,
        resetInterests,
      }}
    >
      {children}
    </TourismContext.Provider>
  );
}

export function useTourism() {
  const context = useContext(TourismContext);
  if (context === undefined) {
    throw new Error('useTourism must be used within a TourismProvider');
  }
  return context;
}
