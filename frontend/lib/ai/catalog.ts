import { HairstyleCatalogItem } from './types';

export const HAIRSTYLE_CATALOG: HairstyleCatalogItem[] = [
  // ==================== BOYS' HAIRSTYLES ====================
  {
    id: 'HS-B01',
    name: 'Textured Crop',
    targetGender: 'boy',
    description: 'A contemporary short cut with textured forward fringe and clean skin fade on the sides.',
    category: 'Fade',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Round', 'Heart'],
    suitableHairTypes: ['Straight', 'Wavy', 'Curly'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-BOY-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Apply matte clay through damp hair and push fringe forward.'
  },
  {
    id: 'HS-B02',
    name: 'Quiff',
    targetGender: 'boy',
    description: 'Front hair brushed upward and back for vertical volume with neatly tapered sides.',
    category: 'Modern',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Round', 'Square', 'Oval'],
    suitableHairTypes: ['Straight', 'Wavy', 'Curly'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-BOY-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Blow dry hair upward from roots; lock with high-hold texture paste.'
  },
  {
    id: 'HS-B03',
    name: 'Pompadour',
    targetGender: 'boy',
    description: 'Classic high volume swept up and back in a wave with tapered temple contours.',
    category: 'Classic',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Round', 'Square'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-BOY-HAIRCUT-01',
    maintenanceLevel: 'High',
    stylingTips: 'Use round brush during blow dry; finish with medium-to-high shine pomade.'
  },
  {
    id: 'HS-B04',
    name: 'Buzz Cut',
    targetGender: 'boy',
    description: 'Sharp, ultra-low maintenance military clipper cut with high skin fade.',
    category: 'Fade',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Square', 'Oval', 'Diamond'],
    suitableHairTypes: ['Straight', 'Wavy', 'Curly', 'Coily'],
    suitableHairDensities: ['Thin', 'Medium', 'Thick'],
    baseServiceId: 'SRV-BOY-HAIRCUT-01',
    maintenanceLevel: 'Low',
    stylingTips: 'Wash and go; apply lightweight scalp moisturizer daily.'
  },
  {
    id: 'HS-B05',
    name: 'Side Part',
    targetGender: 'boy',
    description: 'Sophisticated professional side part with clean scissor-tapered sides.',
    category: 'Classic',
    imageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Oblong', 'Square'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Thin', 'Medium', 'Thick'],
    baseServiceId: 'SRV-BOY-HAIRCUT-01',
    maintenanceLevel: 'Low',
    stylingTips: 'Comb into natural side part while damp; set with matte grooming cream.'
  },
  {
    id: 'HS-B06',
    name: 'Undercut',
    targetGender: 'boy',
    description: 'Dramatic contrast cut with shaved back and sides and longer top hair.',
    category: 'Modern',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Square', 'Round'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-BOY-HAIRCUT-01',
    maintenanceLevel: 'High',
    stylingTips: 'Maintain side trims every 2-3 weeks. Style top back with strong wax.'
  },
  {
    id: 'HS-B07',
    name: 'Faux Hawk',
    targetGender: 'boy',
    description: 'Tapered fade sides with center hair styled upward toward a subtle crest.',
    category: 'Modern',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Round', 'Oval', 'Heart'],
    suitableHairTypes: ['Straight', 'Wavy', 'Curly'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-BOY-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Pinch hair toward center crest with texturizing gum.'
  },
  {
    id: 'HS-B08',
    name: 'Crew Cut',
    targetGender: 'boy',
    description: 'Classic athletic haircut with short sides and slightly longer front hairline.',
    category: 'Short',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Square', 'Oblong'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-BOY-HAIRCUT-01',
    maintenanceLevel: 'Low',
    stylingTips: 'Towel dry and comb forward with a touch of lightweight gel.'
  },

  // ==================== GIRLS' HAIRSTYLES ====================
  {
    id: 'HS-G01',
    name: 'Butterfly Cut',
    targetGender: 'girl',
    description: 'Cascading long layers that frame the face with wing-like feathered movement and volume.',
    category: 'Layered',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Square', 'Round', 'Heart'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-GIRL-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Blow dry with a large round ceramic brush curling outward away from face.'
  },
  {
    id: 'HS-G02',
    name: 'Curtain Bob',
    targetGender: 'girl',
    description: 'Chic chin-grazing bob featuring soft center-parted curtain bangs framing cheekbones.',
    category: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Heart', 'Diamond', 'Oblong'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Thin', 'Medium'],
    baseServiceId: 'SRV-GIRL-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Blow dry curtain bangs with a medium barrel brush; finish with shine serum.'
  },
  {
    id: 'HS-G03',
    name: 'Wolf Cut',
    targetGender: 'girl',
    description: 'Dynamic choppy crown layers with wispy face-framing fringe tapering to soft lengths.',
    category: 'Modern',
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Heart', 'Diamond', 'Round'],
    suitableHairTypes: ['Wavy', 'Curly', 'Straight'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-GIRL-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Air dry with texturizing curl cream or diffuse to boost natural wave pattern.'
  },
  {
    id: 'HS-G04',
    name: 'Pixie Cut',
    targetGender: 'girl',
    description: 'Ultra-chic short crop with delicate wispy front fringe and clean tapered neckline.',
    category: 'Short',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Heart', 'Square'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Thin', 'Medium', 'Thick'],
    baseServiceId: 'SRV-GIRL-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Use a dime-sized amount of styling pomade to piece out front layers.'
  },
  {
    id: 'HS-G05',
    name: 'Shag',
    targetGender: 'girl',
    description: 'Effortless 70s-inspired layered cut with feathered bangs and rock-and-roll texture.',
    category: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Heart', 'Round', 'Oblong', 'Diamond'],
    suitableHairTypes: ['Wavy', 'Curly'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-GIRL-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Scrunch in sea-salt spray to enhance lived-in movement.'
  },
  {
    id: 'HS-G06',
    name: 'Layered Cut',
    targetGender: 'girl',
    description: 'Versatile graduated layers that eliminate bulky weight and create natural body.',
    category: 'Long',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Round', 'Square', 'Heart'],
    suitableHairTypes: ['Straight', 'Wavy', 'Curly'],
    suitableHairDensities: ['Medium', 'Thick'],
    baseServiceId: 'SRV-GIRL-HAIRCUT-01',
    maintenanceLevel: 'Low',
    stylingTips: 'Apply thermal protectant before blowout; curl ends lightly with curling iron.'
  },
  {
    id: 'HS-G07',
    name: 'French Bob',
    targetGender: 'girl',
    description: 'Classic lip-length blunt bob with eyebrow-skimming bangs and timeless Parisian flair.',
    category: 'Short',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Oval', 'Heart', 'Oblong'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Thin', 'Medium'],
    baseServiceId: 'SRV-GIRL-HAIRCUT-01',
    maintenanceLevel: 'Medium',
    stylingTips: 'Straighten with flat iron and tuck one side behind ear for a Parisian look.'
  },
  {
    id: 'HS-G08',
    name: 'Lob',
    targetGender: 'girl',
    description: 'Long bob grazing the collarbone, balancing the ease of a bob with the styling versatility of long hair.',
    category: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    suitableFaceShapes: ['Round', 'Square', 'Oval', 'Heart'],
    suitableHairTypes: ['Straight', 'Wavy'],
    suitableHairDensities: ['Thin', 'Medium', 'Thick'],
    baseServiceId: 'SRV-GIRL-HAIRCUT-01',
    maintenanceLevel: 'Low',
    stylingTips: 'Wrap mid-lengths around a wide curling wand to create soft beachy waves.'
  }
];

// Aliases mapping for backward compatibility (HS01 -> HS-B01 etc.)
const LEGACY_MAP: Record<string, string> = {
  'HS01': 'HS-B01',
  'HS02': 'HS-B03',
  'HS03': 'HS-G02',
  'HS04': 'HS-B04',
  'HS05': 'HS-B02',
  'HS06': 'HS-B05',
  'HS07': 'HS-G05',
  'HS08': 'HS-B06'
};

export function getHairstyleById(id: string): HairstyleCatalogItem | undefined {
  const resolvedId = LEGACY_MAP[id] || id;
  return HAIRSTYLE_CATALOG.find(item => item.id === resolvedId || item.id === id);
}

export function getAllHairstyles(): HairstyleCatalogItem[] {
  return [...HAIRSTYLE_CATALOG];
}

export function getHairstylesByGender(gender: 'boy' | 'girl' | 'all'): HairstyleCatalogItem[] {
  if (gender === 'all') return [...HAIRSTYLE_CATALOG];
  return HAIRSTYLE_CATALOG.filter(item => item.targetGender === gender || item.targetGender === 'unisex');
}
