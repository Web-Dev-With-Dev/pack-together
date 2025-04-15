"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrip } from "@/lib/trip-context";
import { generateId, formatDate, getDefaultCategories } from "@/lib/utils";
import { PlusCircle, Backpack, Calendar, Trash2, AlertCircle, Pencil, Plane, Car, Train, Ship, Bike, Bus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Trip } from "@/lib/types";

export function TripSelector() {
  const { trips, currentTrip, setCurrentTrip, addTrip, deleteTrip, updateTrip } = useTrip();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [tripName, setTripName] = useState("");
  const [transportation, setTransportation] = useState("");

  // Add function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check if selected date is before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Cannot select a past date", {
        description: "Please select today or a future date"
      });
      return;
    }

    if (endDate && value >= endDate) {
      toast.error("Start date must be earlier than End date", {
        position: "top-center",
        duration: 2000,
      });
      return;
    }
    setStartDate(value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (startDate && value <= startDate) {
      toast.error("End date must be later than Start date", {
        position: "top-center",
        duration: 2000,
      });
      return;
    }
    setEndDate(value);
  };

  const handleAddTrip = () => {
    // Get the correct trip name based on whether we're in the dialog or initial form
    const nameToCheck = isDialogOpen ? tripName : newTripName;

    if (!nameToCheck.trim()) {
      toast.error("Please enter a trip name");
      return;
    }

    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    if (!endDate) {
      toast.error("Please select an end date");
      return;
    }

    // Check if start date is before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripStartDate = new Date(startDate);
    tripStartDate.setHours(0, 0, 0, 0);

    if (tripStartDate < today) {
      toast.error("Start date cannot be in the past", {
        description: "Please select a start date from today onwards"
      });
      return;
    }

    // Handle duplicate trip names
    let finalTripName = nameToCheck.trim();
    const baseNamePattern = /^(.*?)(?:\s*\(\d+\))?$/;
    const baseName = finalTripName.match(baseNamePattern)?.[1] || finalTripName;
    
    // Find existing trips with the same base name
    const existingTrips = trips.filter(trip => 
      trip.name.match(baseNamePattern)?.[1] === baseName
    );

    if (existingTrips.length > 0) {
      // Find the highest number used
      const numbers = existingTrips.map(trip => {
        const match = trip.name.match(/\((\d+)\)$/);
        return match ? parseInt(match[1]) : 0;
      });
      const highestNumber = Math.max(...numbers, 0);
      
      // Append the next number
      finalTripName = `${baseName} (${highestNumber + 1})`;
    }

    // Get mandatory items for selected transportation
    const selectedTransport = transportationOptions.find(opt => opt.value === transportation);
    const mandatoryItems = selectedTransport?.mandatoryItems || [];

    const newTrip = {
      id: generateId(),
      name: finalTripName,
      startDate,
      endDate,
      people: [],
      items: [...mandatoryItems],
      categories: getDefaultCategories(),
      transportation: transportation || "Not specified",
    };

    addTrip(newTrip);
    toast.success(`Trip "${finalTripName}" created`);
    
    if (mandatoryItems.length > 0) {
      toast.info(`Added ${mandatoryItems.length} mandatory items for ${selectedTransport?.label}`, {
        duration: 4000,
      });
    }

    setNewTripName("");
    setTripName("");
    setStartDate("");
    setEndDate("");
    setTransportation("");
    setIsDialogOpen(false);
  };

  const handleDeleteTrip = (tripId: string, tripName: string) => {
    if (window.confirm(`Are you sure you want to delete "${tripName}"?`)) {
      deleteTrip(tripId);
      toast.error(`Trip "${tripName}" deleted`, {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const handleTripSelect = (trip: Trip) => {
    setCurrentTrip(trip);
    toast.success(`Switched to trip: ${trip.name}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  const handleEditTrip = (trip: Trip) => {
    setTripToEdit(trip);
    setTripName(trip.name);
    setStartDate(trip.startDate || "");
    setEndDate(trip.endDate || "");
    setTransportation(trip.transportation || "");
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!tripToEdit || !tripName.trim()) {
      toast.error("Please enter a trip name");
      return;
    }

    // Check if start date is before today when editing
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const tripStartDate = new Date(startDate);
    tripStartDate.setHours(0, 0, 0, 0); // Reset time to start of day

    if (tripStartDate < today) {
      toast.error("Start date cannot be in the past", {
        description: "Please select a start date from today onwards"
      });
      return;
    }

    // Get mandatory items for selected transportation
    const selectedTransport = transportationOptions.find(opt => opt.value === transportation);
    const mandatoryItems = selectedTransport?.mandatoryItems || [];

    // Keep existing non-mandatory items and mandatory items that aren't transport-specific
    const existingItems = tripToEdit.items.filter(item => 
      !item.isMandatory || // Keep non-mandatory items
      (item.isMandatory && !item.isTransportRequired) // Keep mandatory items that aren't transport-specific
    );

    const updatedTrip = {
      ...tripToEdit,
      name: tripName.trim(),
      startDate: startDate || "",
      endDate: endDate || "",
      transportation: transportation || "Not specified",
      items: [...mandatoryItems, ...existingItems]  // Combine new transport mandatory items with existing items
    };

    updateTrip(updatedTrip);
    toast.success(`Updated trip: ${tripName}`);
    
    if (transportation !== tripToEdit.transportation && mandatoryItems.length > 0) {
      toast.info(`Updated mandatory items for ${selectedTransport?.label}`, {
        duration: 4000,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setTripName("");
    setStartDate("");
    setEndDate("");
    setTransportation("");
    setTripToEdit(null);
    setIsEditMode(false);
    setIsDialogOpen(false);
  };

  const transportationOptions = [
    { 
      value: "plane", 
      label: "Plane ✈️", 
      icon: Plane,
      instructions: [
        "Passport/ID is mandatory",
        "Check airline baggage weight limits (usually 20-23kg)",
        "Liquids must be under 100ml",
        "Arrive 2-3 hours before departure",
        "Check visa requirements"
      ],
      mandatoryItems: [
        { id: "passport", name: "Passport", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "boarding-pass", name: "Boarding Pass", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "travel-insurance", name: "Travel Insurance", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "visa", name: "Visa (if required)", category: "Documents", isMandatory: true, isTransportRequired: true }
      ]
    },
    { 
      value: "car", 
      label: "Car 🚗", 
      icon: Car,
      instructions: [
        "Check vehicle documents",
        "Verify insurance coverage",
        "Check tire pressure and car condition",
        "Plan rest stops every 2 hours",
        "Pack emergency kit"
      ],
      mandatoryItems: [
        { id: "drivers-license", name: "Driver's License", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "car-insurance", name: "Car Insurance", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "car-registration", name: "Car Registration", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "emergency-kit", name: "Emergency Kit", category: "Safety", isMandatory: true, isTransportRequired: true }
      ]
    },
    { 
      value: "train", 
      label: "Train 🚂", 
      icon: Train,
      instructions: [
        "Check baggage size limits",
        "Arrive 30 minutes early",
        "Keep ticket accessible",
        "Note your seat/car number",
        "Check if food service available"
      ],
      mandatoryItems: [
        { id: "train-ticket", name: "Train Ticket", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "id-card", name: "ID Card", category: "Documents", isMandatory: true, isTransportRequired: true }
      ]
    },
    { 
      value: "ship", 
      label: "Ship 🚢", 
      icon: Ship,
      instructions: [
        "Check boarding requirements",
        "Pack motion sickness remedies",
        "Verify passport/ID requirements",
        "Note emergency procedures",
        "Check weather conditions"
      ],
      mandatoryItems: [
        { id: "ship-ticket", name: "Ship Ticket", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "passport-ship", name: "Passport", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "motion-sickness", name: "Motion Sickness Medicine", category: "Health", isMandatory: true, isTransportRequired: true }
      ]
    },
    { 
      value: "bike", 
      label: "Bike 🚲", 
      icon: Bike,
      instructions: [
        "Check bike condition",
        "Pack repair kit",
        "Wear protective gear",
        "Plan route carefully",
        "Check weather forecast"
      ],
      mandatoryItems: [
        { id: "helmet", name: "Helmet", category: "Safety", isMandatory: true, isTransportRequired: true },
        { id: "bike-repair", name: "Basic Repair Kit", category: "Equipment", isMandatory: true, isTransportRequired: true },
        { id: "bike-lock", name: "Bike Lock", category: "Equipment", isMandatory: true, isTransportRequired: true }
      ]
    },
    { 
      value: "bus", 
      label: "Bus 🚌", 
      icon: Bus,
      instructions: [
        "Check luggage weight limits",
        "Arrive 15-30 minutes early",
        "Keep ticket and ID ready",
        "Note rest stop schedule",
        "Pack essential items in hand luggage"
      ],
      mandatoryItems: [
        { id: "bus-ticket", name: "Bus Ticket", category: "Documents", isMandatory: true, isTransportRequired: true },
        { id: "id-card-bus", name: "ID Card", category: "Documents", isMandatory: true, isTransportRequired: true }
      ]
    }
  ];

  const getTransportIcon = (value: string) => {
    const option = transportationOptions.find(opt => opt.value === value);
    return option ? option.icon : null;
  };

  const renderTransportInstructions = (transportType: string) => {
    const option = transportationOptions.find(opt => opt.value === transportType);
    if (!option?.instructions) return null;

    return (
      <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
        <h3 className="font-medium mb-2 text-blue-800">Important Instructions:</h3>
        <ul className="space-y-1 text-sm text-blue-700">
          {option.instructions.map((instruction, index) => (
            <li key={index} className="flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
              {instruction}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const TransportationSelect = () => (
    <div className="space-y-2">
      <label htmlFor="transportation" className="text-sm font-medium">
        Transportation
      </label>
      <Select value={transportation} onValueChange={setTransportation}>
        <SelectTrigger id="transportation" className="w-full">
          <SelectValue placeholder="How are you traveling?" />
        </SelectTrigger>
        <SelectContent>
          {transportationOptions.map(({ value, label, icon: Icon }) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {transportation && renderTransportInstructions(transportation)}
    </div>
  );

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-lightsky rounded-2xl">
        <Card className="w-full max-w-md hover:shadow-2xl transition-shadow duration-300 hover:font-bold text-center">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center font-extrabold text-3xl">PackTogether</CardTitle>
            <CardDescription className="text-center text-lg">
              Start by creating your first trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="tripName" className="text-sm font-medium">
                  Trip Name
                </label>
                <Input
                  id="tripName"
                  placeholder="Enter trip name"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    min={getTodayDate()}
                    max={endDate || undefined}
                    onChange={(e) => handleStartDateChange(e)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => handleEndDateChange(e)}
                  />
                </div>
              </div>
              <TransportationSelect />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleAddTrip}
              disabled={!newTripName.trim()}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Trip
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-start mb-8 px-4">
          <div className="flex items-center gap-8">
            <h2 className="text-3xl font-bold">Your Trips</h2>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button className="px-6 bg-black hover:bg-black/90 text-white">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  New Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Trip" : "New Trip"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="tripName" className="text-sm font-medium">
                      Trip Name
                    </label>
                    <Input
                      id="tripName"
                      placeholder="Enter trip name"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="text-center"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="startDate" className="text-sm font-medium">
                        Start Date
                      </label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        min={getTodayDate()}
                        max={endDate || undefined}
                        onChange={(e) => handleStartDateChange(e)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="endDate" className="text-sm font-medium">
                        End Date
                      </label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => handleEndDateChange(e)}
                      />
                    </div>
                  </div>
                  <TransportationSelect />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={isEditMode ? handleSaveEdit : handleAddTrip}
                    disabled={!tripName.trim() || !startDate || !endDate}
                    className="bg-black hover:bg-black/90 text-white"
                  >
                    {isEditMode ? "Save Changes" : "Create Trip"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              className={`cursor-pointer hover:border-primary transition-all duration-300 bg-slate-50 hover:bg-slate-100 hover:shadow-lg transform hover:-translate-y-1 ${
                currentTrip?.id === trip.id ? "border-primary border-2" : ""
              }`}
            >
              <CardHeader className="relative">
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTrip(trip);
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit trip"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(trip.id, trip.name);
                    }}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    title="Delete trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div onClick={() => handleTripSelect(trip)}>
                  <CardTitle className="font-display tracking-tight">{trip.name}</CardTitle>
                  <div className="flex flex-col gap-2 mt-2">
                    {(trip.startDate || trip.endDate) && (
                      <CardDescription className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {trip.startDate && formatDate(trip.startDate)}
                        {trip.startDate && trip.endDate && " - "}
                        {trip.endDate && formatDate(trip.endDate)}
                      </CardDescription>
                    )}
                    {trip.transportation && trip.transportation !== "Not specified" && (
                      <CardDescription className="flex items-center text-blue-600">
                        {(() => {
                          const Icon = getTransportIcon(trip.transportation);
                          return Icon ? <Icon className="h-4 w-4 mr-1" /> : null;
                        })()}
                        <span>Traveling by {trip.transportation}</span>
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent 
                onClick={() => handleTripSelect(trip)}
                className="hover:bg-slate-200/50 transition-colors duration-200"
              >
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{trip.people.length} People</p>
                  </div>
                  <div className="flex items-center">
                    <Backpack className="h-4 w-4 mr-1" />
                    <p>{trip.items.length} Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
