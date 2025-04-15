// List of restricted items that cannot be transported by vehicle
const restrictedKeywords = [
  'flammable',
  'explosive',
  'gas',
  'compressed gas',
  'corrosive',
  'acid',
  'battery',
  'lithium',
  'fuel',
  'petrol',
  'gasoline',
  'diesel',
  'kerosene',
  'alcohol',
  'paint thinner',
  'fireworks',
  'ammunition',
  'poison',
  'toxic',
  'radioactive',
  'mercury',
  'pesticide',
  'herbicide',
  'bleach',
  'aerosol',
  'spray paint',
  'lighter fluid',
  'matches',
  'propane',
  'butane'
];

export function isRestrictedItem(itemName: string): boolean {
  const normalizedName = itemName.toLowerCase().trim();
  return restrictedKeywords.some(keyword => 
    normalizedName.includes(keyword.toLowerCase())
  );
} 