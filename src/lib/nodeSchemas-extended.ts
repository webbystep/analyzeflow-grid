// Extended node schemas with revenue attribution fields
// This file contains the revenue attribution logic that needs to be injected into each schema

import { FieldSchema } from './nodeSchemas';

// Revenue mode selector field (for properties section)
export const revenueModeField: FieldSchema = {
  id: 'revenueMode',
  label: 'Bevétel típusa',
  type: 'select',
  help: 'Hogyan járul hozzá ez a lépés a bevételhez?',
  options: [
    { value: 'direct', label: 'Közvetlen bevétel' },
    { value: 'assisted', label: 'Közvetett/hozzájáruló bevétel' },
    { value: 'none', label: 'Nincs bevétel' }
  ]
};

// Value per conversion field (for metrics section)
export const valuePerConversionField: FieldSchema = {
  id: 'valuePerConversion',
  label: 'Egy konverzió értéke',
  type: 'currency',
  suffix: 'Ft',
  help: 'Mennyit ér számodra 1 kitöltés / lead / regisztráció Ft-ban.',
  placeholder: '0',
  step: 100
};

// Estimated revenue field (calculated, for metrics section)
export const estimatedRevenueField: FieldSchema = {
  id: 'estimatedRevenue',
  label: 'Becsült bevétel',
  type: 'currency',
  suffix: 'Ft',
  readOnly: true,
  role: 'revenue_output',
  helpText: 'Ez automatikusan számolt érték: konverziók × egy konverzió értéke.',
  calculate: (data) => {
    const convs = Number(data.conversions) || Number(data.submissions) || Number(data.orders) || 0;
    const valuePerConv = typeof data.valuePerConversion === 'object' 
      ? Number(data.valuePerConversion?.value) || 0
      : Number(data.valuePerConversion) || 0;
    return (convs * valuePerConv).toFixed(0);
  }
};
