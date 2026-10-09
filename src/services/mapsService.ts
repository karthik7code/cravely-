export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
  waypoints: LatLng[];
  isDemoMode: boolean;
}

// Haversine formula to compute distance between two coordinates
export function calculateDistanceKm(pos1: LatLng, pos2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Generate realistic intermediate coordinates along road turns for smooth rider tracking animation
export function generateRoutePoints(start: LatLng, end: LatLng, numPoints = 12): LatLng[] {
  const points: LatLng[] = [];
  // Add subtle road zigzag realism
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const directLat = start.lat + (end.lat - start.lat) * fraction;
    const directLng = start.lng + (end.lng - start.lng) * fraction;
    
    // Add realistic road curve deviation in middle
    const roadDev = Math.sin(fraction * Math.PI) * 0.0018;
    points.push({
      lat: directLat + (i % 2 === 0 ? roadDev : -roadDev * 0.5),
      lng: directLng + roadDev * 0.7,
    });
  }
  return points;
}

// Calculate realistic 10-15 min quick commerce ETA based on prep time, traffic density and distance
export function calculateDeliveryETA(distanceKm: number, orderStatus: string): { etaMinutes: number; label: string } {
  // Speed ~ 20-25 km/h in city traffic + dark store packing time
  const travelTimeMinutes = Math.max(4, Math.round(distanceKm * 2.8));
  
  switch (orderStatus) {
    case 'placed':
      return { etaMinutes: travelTimeMinutes + 8, label: 'Order being packed' };
    case 'confirmed':
    case 'preparing':
      return { etaMinutes: travelTimeMinutes + 6, label: 'Dark store packing order' };
    case 'ready_for_pickup':
      return { etaMinutes: travelTimeMinutes + 3, label: 'Rider arriving at store' };
    case 'out_for_delivery':
      return { etaMinutes: travelTimeMinutes, label: 'Rider on the way' };
    case 'delivered':
      return { etaMinutes: 0, label: 'Delivered' };
    default:
      return { etaMinutes: 12, label: 'Estimated 10-14 mins' };
  }
}

// Check if customer address is within serviceable radius of dark stores
export function checkServiceability(
  customerPos: LatLng,
  stores: { lat: number; lng: number; operatingRadiusKm: number; isOpen: boolean }[]
): { isServiceable: boolean; nearestStoreIndex: number; distanceKm: number } {
  let minDistance = Infinity;
  let nearestIdx = -1;

  stores.forEach((store, idx) => {
    if (!store.isOpen) return;
    const dist = calculateDistanceKm(customerPos, store);
    if (dist < minDistance) {
      minDistance = dist;
      nearestIdx = idx;
    }
  });

  const isServiceable = nearestIdx !== -1 && minDistance <= stores[nearestIdx].operatingRadiusKm;
  return {
    isServiceable,
    nearestStoreIndex: nearestIdx,
    distanceKm: minDistance === Infinity ? 0 : minDistance,
  };
}
