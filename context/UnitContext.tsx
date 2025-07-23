import { createContext, useContext } from 'react';

export const UnitContext = createContext<{ unit: 'C' | 'F'; setUnit: (u: 'C' | 'F') => void }>({ unit: 'C', setUnit: () => {} });
export const useUnit = () => useContext(UnitContext); 