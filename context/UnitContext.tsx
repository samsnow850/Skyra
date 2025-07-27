import { createContext, useContext } from 'react';

export const UnitContext = createContext<{ 
  unit: 'C' | 'F'; 
  setUnit: (u: 'C' | 'F') => void;
  windUnit: 'mph' | 'kph';
  setWindUnit: (u: 'mph' | 'kph') => void;
}>({ 
  unit: 'C', 
  setUnit: () => {},
  windUnit: 'mph',
  setWindUnit: () => {}
});

export const useUnit = () => useContext(UnitContext); 