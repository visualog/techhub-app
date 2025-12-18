// src/context/FilterContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import feeds from '@/data/feeds.json';

// Available sources
const allSources = feeds.map(feed => feed.name);

interface FilterContextType {
  selectedSources: string[];
  allSources: string[];
  toggleSource: (source: string) => void;
  resetSources: () => void;
  isSourceSelected: (source: string) => boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedSources, setSelectedSources] = useState<string[]>(allSources); // Default: all selected

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const resetSources = () => {
    setSelectedSources(allSources);
  };

  const isSourceSelected = (source: string) => selectedSources.includes(source);

  return (
    <FilterContext.Provider value={{ selectedSources, allSources, toggleSource, resetSources, isSourceSelected }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
