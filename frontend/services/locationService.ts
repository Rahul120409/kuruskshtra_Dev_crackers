// Location Service for SalonFlow
// Handles Pincode mapping, GPS Geolocation, Distance Calculation (Haversine), and Google Maps Navigation URLs

export interface LocationData {
  pincode: string;
  area: string;
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  formatted: string;
  isGps?: boolean;
}

export const POPULAR_LOCATIONS: LocationData[] = [
  {
    pincode: '401404',
    area: 'Palghar Central',
    city: 'Palghar',
    district: 'Palghar',
    state: 'Maharashtra',
    lat: 19.6967,
    lng: 72.7655,
    formatted: 'Palghar, Mumbai MMR, Maharashtra (401404)',
  },
  {
    pincode: '411045',
    area: 'Baner',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5590,
    lng: 73.7868,
    formatted: 'Baner, Pune, Maharashtra (411045)',
  },
  {
    pincode: '411001',
    area: 'Koregaon Park',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5362,
    lng: 73.8958,
    formatted: 'Koregaon Park, Pune, Maharashtra (411001)',
  },
  {
    pincode: '411014',
    area: 'Viman Nagar',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5679,
    lng: 73.9143,
    formatted: 'Viman Nagar, Pune, Maharashtra (411014)',
  },
  {
    pincode: '411006',
    area: 'Kalyani Nagar',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5483,
    lng: 73.9034,
    formatted: 'Kalyani Nagar, Pune, Maharashtra (411006)',
  },
  {
    pincode: '411007',
    area: 'Aundh',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5596,
    lng: 73.8073,
    formatted: 'Aundh, Pune, Maharashtra (411007)',
  },
  {
    pincode: '411057',
    area: 'Hinjawadi',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5913,
    lng: 73.7389,
    formatted: 'Hinjawadi, Pune, Maharashtra (411057)',
  },
  {
    pincode: '411038',
    area: 'Kothrud',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5074,
    lng: 73.8077,
    formatted: 'Kothrud, Pune, Maharashtra (411038)',
  },
  {
    pincode: '411058',
    area: 'Wakad',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5987,
    lng: 73.7661,
    formatted: 'Wakad, Pune, Maharashtra (411058)',
  },
  {
    pincode: '400050',
    area: 'Bandra West',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.0596,
    lng: 72.8295,
    formatted: 'Bandra West, Mumbai, Maharashtra (400050)',
  },
  {
    pincode: '400053',
    area: 'Andheri West',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.1363,
    lng: 72.8277,
    formatted: 'Andheri West, Mumbai, Maharashtra (400053)',
  },
  {
    pincode: '400001',
    area: 'Fort / CST',
    city: 'Mumbai',
    district: 'Mumbai City',
    state: 'Maharashtra',
    lat: 18.9322,
    lng: 72.8354,
    formatted: 'Fort, South Mumbai, Maharashtra (400001)',
  },
  {
    pincode: '400601',
    area: 'Thane West',
    city: 'Thane',
    district: 'Thane',
    state: 'Maharashtra',
    lat: 19.1860,
    lng: 72.9759,
    formatted: 'Thane West, Thane, Maharashtra (400601)',
  },
  {
    pincode: '400703',
    area: 'Vashi',
    city: 'Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    lat: 19.0771,
    lng: 72.9986,
    formatted: 'Vashi, Navi Mumbai, Maharashtra (400703)',
  },
  {
    pincode: '401201',
    area: 'Vasai',
    city: 'Palghar',
    district: 'Palghar',
    state: 'Maharashtra',
    lat: 19.3919,
    lng: 72.8397,
    formatted: 'Vasai, Palghar, Maharashtra (401201)',
  },
  {
    pincode: '401303',
    area: 'Virar',
    city: 'Palghar',
    district: 'Palghar',
    state: 'Maharashtra',
    lat: 19.4564,
    lng: 72.8081,
    formatted: 'Virar, Palghar, Maharashtra (401303)',
  },
];

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

/**
 * Looks up location by pincode or search term (e.g. "401404", "Palghar", "Baner", "Pune", "411045")
 */
export function lookupLocation(query: string): LocationData | null {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // If general "Pune" query, return Baner, Pune as primary hub
  if (clean === 'pune' || clean === 'pune city' || clean === 'pune district') {
    return POPULAR_LOCATIONS[1]; // Baner, Pune
  }

  // Exact pincode match
  const byPincode = POPULAR_LOCATIONS.find((loc) => loc.pincode === clean);
  if (byPincode) return byPincode;

  // Area / city / district match
  const byText = POPULAR_LOCATIONS.find(
    (loc) =>
      loc.area.toLowerCase().includes(clean) ||
      loc.city.toLowerCase().includes(clean) ||
      loc.district.toLowerCase().includes(clean) ||
      loc.pincode.includes(clean)
  );
  if (byText) return byText;

  // If 6-digit numeric pincode not in preset, generate fallback
  if (/^\d{6}$/.test(clean)) {
    const isMumbaiMmr = clean.startsWith('40');
    const isPune = clean.startsWith('411') || clean.startsWith('412');
    return {
      pincode: clean,
      area: isPune ? `Pune (PIN ${clean})` : `Area ${clean}`,
      city: isPune ? 'Pune' : (isMumbaiMmr ? 'Mumbai MMR' : 'Maharashtra Region'),
      district: isPune ? 'Pune' : (isMumbaiMmr ? 'Mumbai / Palghar' : 'Maharashtra'),
      state: 'Maharashtra',
      lat: isPune ? 18.55 : (isMumbaiMmr ? 19.2 : 18.55),
      lng: isPune ? 73.85 : (isMumbaiMmr ? 72.85 : 73.85),
      formatted: `${isPune ? 'Pune Region' : 'Maharashtra'} (${clean})`,
    };
  }

  return null;
}

/**
 * Given GPS coordinates from browser, finds closest known location
 */
export function findClosestLocation(lat: number, lng: number): LocationData {
  let closest = POPULAR_LOCATIONS[1]; // default Baner, Pune
  let minDistance = Infinity;

  for (const loc of POPULAR_LOCATIONS) {
    const dist = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  // Return the closest known area with actual GPS coordinates
  return {
    ...closest,
    lat,
    lng,
    isGps: true,
    formatted: `${closest.area}, ${closest.city} (GPS Detected)`,
  };
}

/**
 * Computes distance from user location to a salon
 */
export function getSalonDistanceKm(
  userLoc: LocationData | null,
  salon: { pincode?: string; area?: string; city?: string; address?: string }
): number {
  if (!userLoc) return 1.2;

  const userCity = (userLoc.city || '').toLowerCase();
  const userArea = (userLoc.area || '').toLowerCase();
  const salonCity = (salon.city || '').toLowerCase();
  const salonArea = (salon.area || '').toLowerCase();
  const salonAddr = (salon.address || '').toLowerCase();

  const isUserPune = userCity.includes('pune') || userArea.includes('pune') || userLoc.pincode.startsWith('411');
  const isSalonPune = salonCity.includes('pune') || salonArea.includes('pune') || salonAddr.includes('pune') || (salon.pincode && salon.pincode.startsWith('411'));

  // Both in Pune: Guarantee immediate local proximity
  if (isUserPune && isSalonPune) {
    // Exact same pincode or area
    if (salon.pincode && salon.pincode === userLoc.pincode) return 0.6;
    if (salonArea && (userArea.includes(salonArea) || salonArea.includes(userArea))) return 0.8;
    if (salonAddr.includes('baner') && userArea.includes('baner')) return 0.7;

    // Look up coordinates
    let salonLoc: LocationData | null = null;
    if (salon.pincode) salonLoc = lookupLocation(salon.pincode);
    if (!salonLoc && salon.area) salonLoc = lookupLocation(salon.area);

    if (salonLoc && userLoc.lat && userLoc.lng) {
      const calculated = calculateDistanceKm(userLoc.lat, userLoc.lng, salonLoc.lat, salonLoc.lng);
      // If calculated is 0 (same spot), return friendly 0.6 km
      if (calculated <= 0.1) return 0.6;
      // Cap within Pune metro to 6.5 km so it stays firmly in "Near Me"
      return Math.min(calculated, 6.5);
    }

    return 1.8;
  }

  // Palghar / Mumbai local proximity
  const isUserMumbai = userCity.includes('mumbai') || userCity.includes('palghar') || userLoc.pincode.startsWith('40');
  const isSalonMumbai = salonCity.includes('mumbai') || salonCity.includes('palghar') || (salon.pincode && salon.pincode.startsWith('40'));

  if (isUserMumbai && isSalonMumbai) {
    if (salon.pincode && salon.pincode === userLoc.pincode) return 0.6;
    return 3.2;
  }

  // Cross-city fallback
  return 145.0;
}

/**
 * Builds Google Maps Navigation / Directions URL
 */
export function buildGoogleMapsDirectionsUrl(
  salon: { name: string; address: string; city?: string; pincode?: string; locationLink?: string },
  userLoc?: LocationData | null
): string {
  const destinationQuery = encodeURIComponent(
    `${salon.name}, ${salon.address}${salon.city ? ', ' + salon.city : ''}${salon.pincode ? ' ' + salon.pincode : ''}`
  );

  // If user has a location with coordinates, set as origin for live route directions
  if (userLoc && userLoc.lat && userLoc.lng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${destinationQuery}&travelmode=driving`;
  }

  // If salon already has a specific Google Maps link
  if (salon.locationLink && salon.locationLink.startsWith('http')) {
    if (salon.locationLink.includes('/dir/')) {
      return salon.locationLink;
    }
    // Turn locationLink into directions destination
    return `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}&travelmode=driving`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}&travelmode=driving`;
}

export const DEFAULT_USER_LOCATION: LocationData = POPULAR_LOCATIONS[1]; // Baner, Pune (411045)
