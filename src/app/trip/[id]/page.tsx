"use client";

import { useEffect, useState } from "react";
import { useTrip } from "@/lib/trip-context";
import { Button } from "@/components/ui/button";
import { TemplateManager } from "@/components/templates/template-manager";

export default function TripPage({ params }: { params: { id: string } }) {
  const { trips, currentTrip, setCurrentTrip } = useTrip();
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const trip = trips.find((t) => t.id === params.id);
    if (trip) {
      setCurrentTrip(trip);
    }
  }, [params.id, trips, setCurrentTrip]);

  if (!currentTrip) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{currentTrip.name}</h1>
        <div className="flex gap-2">
          <TemplateManager />
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-blue-200/30 hover:bg-white/90"
          >
            {isEditMode ? "View Mode" : "Edit Mode"}
          </Button>
        </div>
      </div>
      {/* Add your trip content here */}
    </div>
  );
} 