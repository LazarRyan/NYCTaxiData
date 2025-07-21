// NYC Taxi Zone Location ID to Coordinates Mapping
// This provides approximate center coordinates for each taxi zone

export interface LocationCoordinates {
  lat: number;
  lng: number;
  zone: string;
  borough: string;
}

// Approximate center coordinates for NYC taxi zones
// These are rough approximations based on zone locations
export const locationIdToCoordinates: Record<number, LocationCoordinates> = {
  // Manhattan Zones (Yellow Zone)
  4: { lat: 40.7308, lng: -73.9797, zone: "Alphabet City", borough: "Manhattan" },
  12: { lat: 40.7033, lng: -74.0170, zone: "Battery Park", borough: "Manhattan" },
  13: { lat: 40.7117, lng: -74.0161, zone: "Battery Park City", borough: "Manhattan" },
  24: { lat: 40.7589, lng: -73.9851, zone: "Bloomingdale", borough: "Manhattan" },
  41: { lat: 40.8081, lng: -73.9459, zone: "Central Harlem", borough: "Manhattan" },
  42: { lat: 40.8150, lng: -73.9390, zone: "Central Harlem North", borough: "Manhattan" },
  43: { lat: 40.7829, lng: -73.9654, zone: "Central Park", borough: "Manhattan" },
  45: { lat: 40.7158, lng: -73.9970, zone: "Chinatown", borough: "Manhattan" },
  48: { lat: 40.7505, lng: -73.9934, zone: "Clinton East", borough: "Manhattan" },
  50: { lat: 40.7589, lng: -73.9851, zone: "Clinton West", borough: "Manhattan" },
  68: { lat: 40.7484, lng: -74.0016, zone: "East Chelsea", borough: "Manhattan" },
  79: { lat: 40.7265, lng: -73.9816, zone: "East Village", borough: "Manhattan" },
  87: { lat: 40.7075, lng: -74.0107, zone: "Financial District North", borough: "Manhattan" },
  88: { lat: 40.7033, lng: -74.0170, zone: "Financial District South", borough: "Manhattan" },
  90: { lat: 40.7411, lng: -73.9897, zone: "Flatiron", borough: "Manhattan" },
  
  // Brooklyn Zones
  11: { lat: 40.6012, lng: -74.0059, zone: "Bath Beach", borough: "Brooklyn" },
  14: { lat: 40.6168, lng: -74.0325, zone: "Bay Ridge", borough: "Brooklyn" },
  17: { lat: 40.6782, lng: -73.9442, zone: "Bedford", borough: "Brooklyn" },
  21: { lat: 40.6012, lng: -73.9947, zone: "Bensonhurst East", borough: "Brooklyn" },
  22: { lat: 40.6012, lng: -74.0059, zone: "Bensonhurst West", borough: "Brooklyn" },
  25: { lat: 40.6862, lng: -73.9909, zone: "Boerum Hill", borough: "Brooklyn" },
  26: { lat: 40.6344, lng: -73.9965, zone: "Borough Park", borough: "Brooklyn" },
  29: { lat: 40.5776, lng: -73.9596, zone: "Brighton Beach", borough: "Brooklyn" },
  33: { lat: 40.7024, lng: -73.9871, zone: "Brooklyn Heights", borough: "Brooklyn" },
  34: { lat: 40.7024, lng: -73.9721, zone: "Brooklyn Navy Yard", borough: "Brooklyn" },
  35: { lat: 40.6583, lng: -73.9100, zone: "Brownsville", borough: "Brooklyn" },
  36: { lat: 40.7081, lng: -73.9181, zone: "Bushwick North", borough: "Brooklyn" },
  37: { lat: 40.6981, lng: -73.9061, zone: "Bushwick South", borough: "Brooklyn" },
  39: { lat: 40.6412, lng: -73.8881, zone: "Canarsie", borough: "Brooklyn" },
  40: { lat: 40.6802, lng: -73.9909, zone: "Carroll Gardens", borough: "Brooklyn" },
  49: { lat: 40.6862, lng: -73.9609, zone: "Clinton Hill", borough: "Brooklyn" },
  52: { lat: 40.6862, lng: -73.9909, zone: "Cobble Hill", borough: "Brooklyn" },
  54: { lat: 40.6862, lng: -73.9909, zone: "Columbia Street", borough: "Brooklyn" },
  55: { lat: 40.5776, lng: -73.9596, zone: "Coney Island", borough: "Brooklyn" },
  61: { lat: 40.6702, lng: -73.9200, zone: "Crown Heights North", borough: "Brooklyn" },
  62: { lat: 40.6583, lng: -73.9200, zone: "Crown Heights South", borough: "Brooklyn" },
  63: { lat: 40.6802, lng: -73.8700, zone: "Cypress Hills", borough: "Brooklyn" },
  65: { lat: 40.6942, lng: -73.9909, zone: "Downtown Brooklyn/MetroTech", borough: "Brooklyn" },
  66: { lat: 40.7024, lng: -73.9871, zone: "DUMBO/Vinegar Hill", borough: "Brooklyn" },
  67: { lat: 40.6168, lng: -74.0325, zone: "Dyker Heights", borough: "Brooklyn" },
  71: { lat: 40.6583, lng: -73.9100, zone: "East Flatbush/Farragut", borough: "Brooklyn" },
  72: { lat: 40.6583, lng: -73.9200, zone: "East Flatbush/Remsen Village", borough: "Brooklyn" },
  76: { lat: 40.6583, lng: -73.8700, zone: "East New York", borough: "Brooklyn" },
  77: { lat: 40.6583, lng: -73.8800, zone: "East New York/Pennsylvania Avenue", borough: "Brooklyn" },
  80: { lat: 40.7081, lng: -73.9181, zone: "East Williamsburg", borough: "Brooklyn" },
  85: { lat: 40.6583, lng: -73.9200, zone: "Erasmus", borough: "Brooklyn" },
  89: { lat: 40.6583, lng: -73.9200, zone: "Flatbush/Ditmas Park", borough: "Brooklyn" },
  91: { lat: 40.6412, lng: -73.8881, zone: "Flatlands", borough: "Brooklyn" },
  97: { lat: 40.6862, lng: -73.9609, zone: "Fort Greene", borough: "Brooklyn" },
  
  // Queens Zones
  2: { lat: 40.6412, lng: -73.8881, zone: "Jamaica Bay", borough: "Queens" },
  7: { lat: 40.7644, lng: -73.9235, zone: "Astoria", borough: "Queens" },
  8: { lat: 40.7644, lng: -73.9235, zone: "Astoria Park", borough: "Queens" },
  9: { lat: 40.7584, lng: -73.7881, zone: "Auburndale", borough: "Queens" },
  10: { lat: 40.6583, lng: -73.7881, zone: "Baisley Park", borough: "Queens" },
  15: { lat: 40.7644, lng: -73.7881, zone: "Bay Terrace/Fort Totten", borough: "Queens" },
  16: { lat: 40.7644, lng: -73.7881, zone: "Bayside", borough: "Queens" },
  19: { lat: 40.7584, lng: -73.7881, zone: "Bellerose", borough: "Queens" },
  27: { lat: 40.5776, lng: -73.9596, zone: "Breezy Point/Fort Tilden/Riis Beach", borough: "Queens" },
  28: { lat: 40.7081, lng: -73.7881, zone: "Briarwood/Jamaica Hills", borough: "Queens" },
  30: { lat: 40.6412, lng: -73.8881, zone: "Broad Channel", borough: "Queens" },
  38: { lat: 40.7081, lng: -73.7881, zone: "Cambria Heights", borough: "Queens" },
  53: { lat: 40.7644, lng: -73.7881, zone: "College Point", borough: "Queens" },
  56: { lat: 40.7584, lng: -73.8600, zone: "Corona", borough: "Queens" },
  57: { lat: 40.7584, lng: -73.8600, zone: "Corona", borough: "Queens" },
  64: { lat: 40.7644, lng: -73.7881, zone: "Douglaston", borough: "Queens" },
  70: { lat: 40.7644, lng: -73.8600, zone: "East Elmhurst", borough: "Queens" },
  73: { lat: 40.7644, lng: -73.7881, zone: "East Flushing", borough: "Queens" },
  82: { lat: 40.7584, lng: -73.8600, zone: "Elmhurst", borough: "Queens" },
  83: { lat: 40.7584, lng: -73.8600, zone: "Elmhurst/Maspeth", borough: "Queens" },
  86: { lat: 40.5776, lng: -73.9596, zone: "Far Rockaway", borough: "Queens" },
  92: { lat: 40.7644, lng: -73.7881, zone: "Flushing", borough: "Queens" },
  93: { lat: 40.7584, lng: -73.8600, zone: "Flushing Meadows-Corona Park", borough: "Queens" },
  95: { lat: 40.7584, lng: -73.7881, zone: "Forest Hills", borough: "Queens" },
  96: { lat: 40.7584, lng: -73.7881, zone: "Forest Park/Highland Park", borough: "Queens" },
  98: { lat: 40.7584, lng: -73.7881, zone: "Fresh Meadows", borough: "Queens" },
  
  // Bronx Zones
  3: { lat: 40.8584, lng: -73.8297, zone: "Allerton/Pelham Gardens", borough: "Bronx" },
  18: { lat: 40.8584, lng: -73.8297, zone: "Bedford Park", borough: "Bronx" },
  20: { lat: 40.8584, lng: -73.8297, zone: "Belmont", borough: "Bronx" },
  31: { lat: 40.8584, lng: -73.8297, zone: "Bronx Park", borough: "Bronx" },
  32: { lat: 40.8584, lng: -73.8297, zone: "Bronxdale", borough: "Bronx" },
  46: { lat: 40.8584, lng: -73.8297, zone: "City Island", borough: "Bronx" },
  47: { lat: 40.8584, lng: -73.8297, zone: "Claremont/Bathgate", borough: "Bronx" },
  51: { lat: 40.8584, lng: -73.8297, zone: "Co-Op City", borough: "Bronx" },
  58: { lat: 40.8584, lng: -73.8297, zone: "Country Club", borough: "Bronx" },
  59: { lat: 40.8584, lng: -73.8297, zone: "Crotona Park", borough: "Bronx" },
  60: { lat: 40.8584, lng: -73.8297, zone: "Crotona Park East", borough: "Bronx" },
  69: { lat: 40.8584, lng: -73.8297, zone: "East Concourse/Concourse Village", borough: "Bronx" },
  74: { lat: 40.8584, lng: -73.8297, zone: "East Harlem North", borough: "Bronx" },
  78: { lat: 40.8584, lng: -73.8297, zone: "East Tremont", borough: "Bronx" },
  81: { lat: 40.8584, lng: -73.8297, zone: "Eastchester", borough: "Bronx" },
  94: { lat: 40.8584, lng: -73.8297, zone: "Fordham South", borough: "Bronx" },
  
  // Staten Island Zones
  5: { lat: 40.5795, lng: -74.1502, zone: "Arden Heights", borough: "Staten Island" },
  6: { lat: 40.5795, lng: -74.1502, zone: "Arrochar/Fort Wadsworth", borough: "Staten Island" },
  23: { lat: 40.5795, lng: -74.1502, zone: "Bloomfield/Emerson Hill", borough: "Staten Island" },
  44: { lat: 40.5795, lng: -74.1502, zone: "Charleston/Tottenville", borough: "Staten Island" },
  84: { lat: 40.5795, lng: -74.1502, zone: "Eltingville/Annadale/Prince's Bay", borough: "Staten Island" },
  99: { lat: 40.5795, lng: -74.1502, zone: "Freshkills Park", borough: "Staten Island" },
  
  // EWR (Newark Airport)
  1: { lat: 40.6895, lng: -74.1745, zone: "Newark Airport", borough: "EWR" }
};

export function getLocationCoordinates(locationId: number): LocationCoordinates | null {
  return locationIdToCoordinates[locationId] || null;
}

export function getLocationName(locationId: number): string {
  const coords = getLocationCoordinates(locationId);
  return coords ? `${coords.zone}, ${coords.borough}` : `Location ${locationId}`;
} 