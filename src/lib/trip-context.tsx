"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { Trip, Person, Item } from "./types";
import toast from "react-hot-toast";

type TripContextType = {
  trips: Trip[];
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (updatedTrip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  addPerson: (person: Person) => void;
  updatePerson: (updatedPerson: Person) => void;
  deletePerson: (personId: string) => void;
  addItem: (item: Item) => void;
  updateItem: (updatedItem: Item) => void;
  deleteItem: (itemId: string) => void;
  toggleItemPacked: (itemId: string) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  getPersonItems: (personId: string) => Item[];
  getCategoryItems: (category: string) => Item[];
  getPackingProgress: () => { total: number; packed: number; percentage: number };
  getPersonProgress: (personId: string) => { total: number; packed: number; percentage: number };
  removeItem: (tripId: string, itemId: string) => void;
  templates: Trip[];
  saveAsTemplate: (trip: Trip) => void;
  createFromTemplate: (template: Trip) => void;
  deleteTemplate: (templateId: string) => void;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [templates, setTemplates] = useState<Trip[]>([]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const savedTrips = localStorage.getItem("trips");
    const savedCurrentTripId = localStorage.getItem("currentTripId");
    const savedTemplates = localStorage.getItem("templates");

    if (savedTrips) {
      const parsedTrips = JSON.parse(savedTrips);
      setTrips(parsedTrips);

      if (savedCurrentTripId) {
        const currentTrip = parsedTrips.find((trip: Trip) => trip.id === savedCurrentTripId);
        if (currentTrip) {
          setCurrentTrip(currentTrip);
        }
      }
    }

    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save data to localStorage whenever trips or currentTrip changes
  useEffect(() => {
    if (trips.length > 0) {
      localStorage.setItem("trips", JSON.stringify(trips));
    }

    if (currentTrip) {
      localStorage.setItem("currentTripId", currentTrip.id);
    }
  }, [trips, currentTrip]);

  useEffect(() => {
    localStorage.setItem("templates", JSON.stringify(templates));
  }, [templates]);

  const updateTrips = (updatedTrips: Trip[]) => {
    setTrips(updatedTrips);
  };

  const setCurrentTripHandler = (trip: Trip | null) => {
    setCurrentTrip(trip);
  };

  const addTrip = (trip: Trip) => {
    const updatedTrips = [...trips, trip];
    updateTrips(updatedTrips);
    setCurrentTrip(trip);
  };

  const updateTrip = (updatedTrip: Trip) => {
    const updatedTrips = trips.map((trip) =>
      trip.id === updatedTrip.id ? updatedTrip : trip
    );
    updateTrips(updatedTrips);

    if (currentTrip && currentTrip.id === updatedTrip.id) {
      setCurrentTrip(updatedTrip);
    }
  };

  const deleteTrip = (tripId: string) => {
    const updatedTrips = trips.filter((trip) => trip.id !== tripId);
    updateTrips(updatedTrips);

    if (currentTrip && currentTrip.id === tripId) {
      setCurrentTrip(updatedTrips.length > 0 ? updatedTrips[0] : null);
    }
  };

  const addPerson = (person: Person) => {
    if (!currentTrip) return;

    const updatedTrip = {
      ...currentTrip,
      people: [...currentTrip.people, person],
    };

    updateTrip(updatedTrip);
  };

  const updatePerson = (updatedPerson: Person) => {
    if (!currentTrip) return;

    const updatedPeople = currentTrip.people.map((person) =>
      person.id === updatedPerson.id ? updatedPerson : person
    );

    const updatedTrip = {
      ...currentTrip,
      people: updatedPeople,
    };

    updateTrip(updatedTrip);
  };

  const deletePerson = (personId: string) => {
    if (!currentTrip) return;

    // Remove person from the people array
    const updatedPeople = currentTrip.people.filter((person) => person.id !== personId);

    // Unassign items from this person
    const updatedItems = currentTrip.items.map((item) => {
      if (item.assignedTo === personId) {
        return { ...item, assignedTo: "" };
      }
      return item;
    });

    const updatedTrip = {
      ...currentTrip,
      people: updatedPeople,
      items: updatedItems,
    };

    updateTrip(updatedTrip);
  };

  const addItem = (item: Item) => {
    if (!currentTrip) return;

    const updatedTrip = {
      ...currentTrip,
      items: [...currentTrip.items, item],
    };

    // Update person's item count if item is assigned
    if (item.assignedTo) {
      const updatedPeople = currentTrip.people.map((person) => {
        if (person.id === item.assignedTo) {
          return {
            ...person,
            itemCount: person.itemCount + 1,
            packedCount: item.isPacked ? person.packedCount + 1 : person.packedCount,
          };
        }
        return person;
      });

      updatedTrip.people = updatedPeople;
    }

    updateTrip(updatedTrip);
  };

  const updateItem = (updatedItem: Item) => {
    if (!currentTrip) return;

    const existingItem = currentTrip.items.find((item) => item.id === updatedItem.id);
    if (!existingItem) return;

    // Calculate changes in assignment and packing status
    const prevAssignedTo = existingItem.assignedTo;
    const newAssignedTo = updatedItem.assignedTo;
    const wasPackedBefore = existingItem.isPacked;
    const isPackedNow = updatedItem.isPacked;

    // Update items array
    const updatedItems = currentTrip.items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );

    // Update people's item counts based on changes
    let updatedPeople = [...currentTrip.people];

    // Handle reassignment
    if (prevAssignedTo !== newAssignedTo) {
      // Decrement previous assignee's counts
      if (prevAssignedTo) {
        updatedPeople = updatedPeople.map((person) => {
          if (person.id === prevAssignedTo) {
            return {
              ...person,
              itemCount: Math.max(0, person.itemCount - 1),
              packedCount: wasPackedBefore ? Math.max(0, person.packedCount - 1) : person.packedCount,
            };
          }
          return person;
        });
      }

      // Increment new assignee's counts
      if (newAssignedTo) {
        updatedPeople = updatedPeople.map((person) => {
          if (person.id === newAssignedTo) {
            return {
              ...person,
              itemCount: person.itemCount + 1,
              packedCount: isPackedNow ? person.packedCount + 1 : person.packedCount,
            };
          }
          return person;
        });
      }
    }
    // Handle packing status change (when assignee stays the same)
    else if (newAssignedTo && wasPackedBefore !== isPackedNow) {
      updatedPeople = updatedPeople.map((person) => {
        if (person.id === newAssignedTo) {
          return {
            ...person,
            packedCount: isPackedNow
              ? person.packedCount + 1
              : Math.max(0, person.packedCount - 1),
          };
        }
        return person;
      });
    }

    const updatedTrip = {
      ...currentTrip,
      items: updatedItems,
      people: updatedPeople,
    };

    updateTrip(updatedTrip);
  };

  const deleteItem = (itemId: string) => {
    if (!currentTrip) return;

    const itemToDelete = currentTrip.items.find((item) => item.id === itemId);
    if (!itemToDelete) return;

    // Remove item from the items array
    const updatedItems = currentTrip.items.filter((item) => item.id !== itemId);

    // Update person's item count if item was assigned
    let updatedPeople = [...currentTrip.people];
    if (itemToDelete.assignedTo) {
      updatedPeople = updatedPeople.map((person) => {
        if (person.id === itemToDelete.assignedTo) {
          return {
            ...person,
            itemCount: Math.max(0, person.itemCount - 1),
            packedCount: itemToDelete.isPacked ? Math.max(0, person.packedCount - 1) : person.packedCount,
          };
        }
        return person;
      });
    }

    const updatedTrip = {
      ...currentTrip,
      items: updatedItems,
      people: updatedPeople,
    };

    updateTrip(updatedTrip);
  };

  const toggleItemPacked = (itemId: string) => {
    if (!currentTrip) return;

    const item = currentTrip.items.find((item) => item.id === itemId);
    if (!item) return;

    const updatedItem = { ...item, isPacked: !item.isPacked };
    updateItem(updatedItem);
  };

  const addCategory = (category: string) => {
    if (!currentTrip) return;

    if (currentTrip.categories.includes(category)) return;

    const updatedTrip = {
      ...currentTrip,
      categories: [...currentTrip.categories, category],
    };

    updateTrip(updatedTrip);
  };

  const deleteCategory = (category: string) => {
    if (!currentTrip) return;

    // Remove category from the categories array
    const updatedCategories = currentTrip.categories.filter((c) => c !== category);

    // Update items with this category to have an empty category
    const updatedItems = currentTrip.items.map((item) => {
      if (item.category === category) {
        return { ...item, category: "" };
      }
      return item;
    });

    const updatedTrip = {
      ...currentTrip,
      categories: updatedCategories,
      items: updatedItems,
    };

    updateTrip(updatedTrip);
  };

  const getPersonItems = (personId: string): Item[] => {
    if (!currentTrip) return [];
    return currentTrip.items.filter((item) => item.assignedTo === personId);
  };

  const getCategoryItems = (category: string): Item[] => {
    if (!currentTrip) return [];
    return currentTrip.items.filter((item) => item.category === category);
  };

  const getPackingProgress = () => {
    if (!currentTrip || currentTrip.items.length === 0) {
      return { total: 0, packed: 0, percentage: 0 };
    }

    const total = currentTrip.items.length;
    const packed = currentTrip.items.filter((item) => item.isPacked).length;
    const percentage = Math.round((packed / total) * 100);

    return { total, packed, percentage };
  };

  const getPersonProgress = (personId: string) => {
    if (!currentTrip) {
      return { total: 0, packed: 0, percentage: 0 };
    }

    const personItems = getPersonItems(personId);
    const total = personItems.length;

    if (total === 0) {
      return { total: 0, packed: 0, percentage: 0 };
    }

    const packed = personItems.filter((item) => item.isPacked).length;
    const percentage = Math.round((packed / total) * 100);

    return { total, packed, percentage };
  };

  const removeItem = (tripId: string, itemId: string) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        if (trip.id === tripId) {
          // Find the item to check if it's mandatory
          const itemToRemove = trip.items.find(item => item.id === itemId);
          
          // If item is mandatory and transport-required, prevent deletion
          if (itemToRemove?.isMandatory && itemToRemove?.isTransportRequired) {
            toast.error("This item is mandatory for your transportation mode and cannot be removed", {
              duration: 3000,
            });
            return trip;
          }

          return {
            ...trip,
            items: trip.items.filter((item) => item.id !== itemId),
          };
        }
        return trip;
      })
    );
  };

  const saveAsTemplate = (trip: Trip) => {
    // Create a new template with a new ID and reset some properties
    const template: Trip = {
      ...trip,
      id: `template-${Date.now()}`,
      name: `${trip.name} (Template)`,
      startDate: "",
      endDate: "",
      items: trip.items.map(item => ({
        ...item,
        isPacked: false,
        assignedTo: "",
      })),
      people: [],
    };
    setTemplates([...templates, template]);
  };

  const createFromTemplate = (template: Trip) => {
    // Create a new trip from template with a new ID
    const newTrip: Trip = {
      ...template,
      id: `trip-${Date.now()}`,
      name: template.name.replace(" (Template)", ""),
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      items: template.items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isPacked: false,
        assignedTo: "",
      })),
      people: [],
    };
    setTrips([...trips, newTrip]);
    setCurrentTrip(newTrip);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const value = {
    trips,
    currentTrip,
    setCurrentTrip: setCurrentTripHandler,
    addTrip,
    updateTrip,
    deleteTrip,
    addPerson,
    updatePerson,
    deletePerson,
    addItem,
    updateItem,
    deleteItem,
    toggleItemPacked,
    addCategory,
    deleteCategory,
    getPersonItems,
    getCategoryItems,
    getPackingProgress,
    getPersonProgress,
    removeItem,
    templates,
    saveAsTemplate,
    createFromTemplate,
    deleteTemplate,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = (): TripContextType => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
