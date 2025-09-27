export async function getDistanceKm(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`
    );

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return 0;

    const distanceMeters = data.routes[0].distance;
    return distanceMeters / 1000; // convert to km
  } catch (err) {
    console.error("Error fetching distance:", err);
    return 0;
  }
}

// Simple delivery fee calculation based on distance
export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 2) return 0; // free for very nearby orders

  const baseFee = 1.5;
  const perKmRate = 0.5;
  return Math.min(baseFee + distanceKm * perKmRate);
}
