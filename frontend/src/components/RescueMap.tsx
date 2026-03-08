"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { FoodRescue } from "../app/volunteer/page";

interface RescueMapProps {
  rescues: FoodRescue[];
  onRescueClick?: (rescue: FoodRescue) => void;
}

// Pin colors per urgency
const pinColorMap: Record<string, string> = {
  red: "#ef4444",
  yellow: "#f59e0b",
  green: "#10b981",
};

const borderColorMap: Record<string, string> = {
  red: "#dc2626",
  yellow: "#d97706",
  green: "#059669",
};

export default function RescueMap({ rescues, onRescueClick }: RescueMapProps) {
  return (
    <MapContainer
      center={[51.8979, -8.4706]}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      zoomControl={false}
    >
      {/* CartoDB Voyager - clean, professional tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />

      {rescues.map((rescue) => {
        const color = pinColorMap[rescue.pin_color] ?? "#10b981";
        const border = borderColorMap[rescue.pin_color] ?? "#059669";

        return (
          <CircleMarker
            key={rescue.id}
            center={[rescue.business_location.lat, rescue.business_location.lng]}
            radius={rescue.urgency_level === "HIGH" ? 14 : rescue.urgency_level === "MEDIUM" ? 11 : 9}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.92,
              color: border,
              weight: 2.5,
            }}
            eventHandlers={{
              click: () => onRescueClick?.(rescue),
            }}
          >
            <Popup className="rescue-popup">
              <div className="p-2 min-w-[180px]">
                <p className="font-bold text-slate-800 text-sm">{rescue.business_name}</p>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{rescue.extracted_food}</p>
                <div className="mt-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${rescue.urgency_level === "HIGH" ? "bg-red-50 text-red-600" :
                      rescue.urgency_level === "MEDIUM" ? "bg-amber-50 text-amber-600" :
                        "bg-emerald-50 text-emerald-600"}`}>
                    {rescue.urgency_level}
                  </span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
