import React, { useState, useEffect, useRef } from 'react';
import { LatLng, calculateDistanceKm, generateRoutePoints } from '../../services/mapsService';
import { Store, Navigation, MapPin, Bike, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';

interface LiveMapProps {
  storePos: LatLng;
  storeName: string;
  customerPos: LatLng;
  customerAddress: string;
  riderPos?: LatLng;
  orderStatus: string;
  showRider?: boolean;
  className?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  storePos,
  storeName,
  customerPos,
  customerAddress,
  riderPos,
  orderStatus,
  showRider = true,
  className = 'h-72 w-full',
}) => {
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [animatedProgress, setAnimatedProgress] = useState(0.4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate distance
  const distance = calculateDistanceKm(storePos, customerPos);

  // Generate route waypoints between store and customer
  const routePoints = generateRoutePoints(storePos, customerPos, 20);

  // Smoothly move rider based on status
  useEffect(() => {
    let target = 0.2;
    if (orderStatus === 'placed' || orderStatus === 'confirmed') target = 0.05;
    if (orderStatus === 'preparing') target = 0.15;
    if (orderStatus === 'ready_for_pickup') target = 0.25;
    if (orderStatus === 'out_for_delivery') target = 0.65;
    if (orderStatus === 'delivered') target = 1.0;

    // Slowly increment progress towards target
    const interval = setInterval(() => {
      setAnimatedProgress((prev) => {
        if (Math.abs(prev - target) < 0.02) return target;
        return prev + (target - prev) * 0.1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [orderStatus]);

  // Compute bounding box coordinates for SVG projection
  const minLat = Math.min(storePos.lat, customerPos.lat) - 0.006;
  const maxLat = Math.max(storePos.lat, customerPos.lat) + 0.006;
  const minLng = Math.min(storePos.lng, customerPos.lng) - 0.008;
  const maxLng = Math.max(storePos.lng, customerPos.lng) + 0.008;

  // Convert lat/lng to SVG percentage (0% to 100%)
  const toSvgX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng)) * 80 + 10;
  };
  const toSvgY = (lat: number) => {
    return (1 - (lat - minLat) / (maxLat - minLat)) * 80 + 10;
  };

  const storeX = toSvgX(storePos.lng);
  const storeY = toSvgY(storePos.lat);
  const custX = toSvgX(customerPos.lng);
  const custY = toSvgY(customerPos.lat);

  // Compute rider position along routePoints based on progress
  const pointIndex = Math.min(
    routePoints.length - 1,
    Math.max(0, Math.floor(animatedProgress * (routePoints.length - 1)))
  );
  const currentWaypoint = routePoints[pointIndex] || storePos;
  const riderX = toSvgX(riderPos ? riderPos.lng : currentWaypoint.lng);
  const riderY = toSvgY(riderPos ? riderPos.lat : currentWaypoint.lat);

  // Construct SVG path string
  const pathD = routePoints.reduce((acc, pt, i) => {
    const x = toSvgX(pt.lng);
    const y = toSvgY(pt.lat);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-emerald-950/10 shadow-sm ${
        mapStyle === 'streets' ? 'bg-[#f4f7f5]' : 'bg-[#1e293b]'
      } ${className}`}
    >
      {/* Background Street Grid & Decorative Canvas */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={mapStyle === 'streets' ? '#d1d5db' : '#334155'}
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Decorative roads / water / blocks */}
          <path
            d="M 0 60 Q 150 90 300 40 T 600 120"
            fill="none"
            stroke={mapStyle === 'streets' ? '#e2e8f0' : '#475569'}
            strokeWidth="12"
          />
          <path
            d="M 80 0 Q 120 180 200 320"
            fill="none"
            stroke={mapStyle === 'streets' ? '#e2e8f0' : '#475569'}
            strokeWidth="10"
          />
        </svg>
      </div>

      {/* SVG Vector Route Polyline and Pulsing Markers */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#08B968" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Store Coverage Radius circle */}
        <circle
          cx={`${storeX}%`}
          cy={`${storeY}%`}
          r="48"
          fill="#08B968"
          fillOpacity="0.08"
          stroke="#08B968"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Route Line Shadow */}
        <path
          d={pathD}
          fill="none"
          stroke="#000000"
          strokeOpacity="0.1"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Active Route Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 4"
          className="animate-pulse"
        />
      </svg>

      {/* Store Marker Pin */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto"
        style={{ left: `${storeX}%`, top: `${storeY}%` }}
      >
        <div className="group relative flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-100 transition-transform group-hover:scale-110">
            <Store className="h-5 w-5" />
          </div>
          <span className="mt-1 whitespace-nowrap rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shadow border border-emerald-200">
            🏪 Dark Store
          </span>
        </div>
      </div>

      {/* Customer Marker Pin */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto"
        style={{ left: `${custX}%`, top: `${custY}%` }}
      >
        <div className="group relative flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg ring-4 ring-rose-100 transition-transform group-hover:scale-110">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="mt-1 whitespace-nowrap rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-rose-800 shadow border border-rose-200">
            📍 You ({distance} km)
          </span>
        </div>
      </div>

      {/* Animated Rider Marker */}
      {showRider && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out pointer-events-auto z-10"
          style={{ left: `${riderX}%`, top: `${riderY}%` }}
        >
          <div className="group relative flex flex-col items-center">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl ring-4 ring-blue-200 animate-bounce">
              <Bike className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>
            <span className="mt-1 whitespace-nowrap rounded-md bg-blue-900 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              Rider Moving • 8 min ETA
            </span>
          </div>
        </div>
      )}

      {/* Top Overlay Badge — Clear Live / Demo Mode indicator */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm border border-emerald-100">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Google Maps Demo Layer</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm border border-slate-200">
          <Navigation className="h-3 w-3 text-blue-500" />
          <span>{distance} km distance</span>
        </div>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-white/90 backdrop-blur-md px-3 py-2 text-xs text-slate-700 shadow-md border border-slate-200/80">
        <div className="flex items-center gap-2 truncate">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium truncate text-slate-900">{storeName}</span>
          <span className="text-slate-400">→</span>
          <span className="truncate text-slate-600">{customerAddress}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
            className="flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 transition"
          >
            <Layers className="h-3 w-3" />
            <span className="capitalize">{mapStyle}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
