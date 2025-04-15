"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { useTrip } from "@/lib/trip-context";
import { useLanguage } from "@/lib/language-context";
import { generateId, sortItems } from "@/lib/utils";
import {
  PlusCircle,
  Package,
  Trash2,
  CheckCircle,
  Filter,
  ShoppingBag,
  Check,
  Pencil,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { isRestrictedItem } from "@/lib/restrictedItems";

export function ItemsManager() {
  const {
    currentTrip,
    addItem,
    updateItem,
    deleteItem,
    toggleItemPacked,
    addCategory,
    addPerson
  } = useTrip();
  const { t } = useLanguage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [itemAssignedTo, setItemAssignedTo] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemNotes, setItemNotes] = useState("");
  const [itemToEdit, setItemToEdit] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "category" | "assignedTo">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newPersonName, setNewPersonName] = useState("");
  const [showAddPerson, setShowAddPerson] = useState(false);

  const handleAddOrUpdateItem = () => {
    if (!itemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    // Check if the item is restricted
    if (!isEditMode && isRestrictedItem(itemName)) {
      toast.error(t('items.restrictedMessage'), {
        position: "top-center",
        duration: 4000,
        description: t('items.restrictedList')
      });
      return;
    }

    const quantity = Number.parseInt(itemQuantity) || 1;

    if (isEditMode && itemToEdit) {
      const originalItem = currentTrip?.items.find(item => item.id === itemToEdit);

      if (originalItem) {
        const updatedItem = {
          ...originalItem,
          name: itemName.trim(),
          category: itemCategory,
          assignedTo: itemAssignedTo,
          quantity,
          notes: itemNotes.trim(),
        };

        updateItem(updatedItem);
        toast.success(`Updated ${itemName}`, {
          position: "top-center",
          duration: 2000,
          className: "bg-blue-50 text-blue-600 border border-blue-200",
          icon: <CheckCircle className="h-5 w-5 text-blue-500" />
        });
      }
    } else {
      const newItem = {
        id: generateId(),
        name: itemName.trim(),
        category: itemCategory,
        assignedTo: itemAssignedTo,
        quantity,
        isPacked: false,
        notes: itemNotes.trim(),
      };

      addItem(newItem);
      toast.success(`Added ${itemName} to the trip`, {
        position: "top-center",
        duration: 2000,
        className: "bg-blue-50 text-blue-600 border border-blue-200",
        icon: <CheckCircle className="h-5 w-5 text-blue-500" />
      });
    }

    resetItemForm();
    setIsDialogOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setItemCategory(newCategory.trim());
      setNewCategory("");
      setShowAddCategory(false);
      toast.success(`Added category: ${newCategory}`, {
        position: "top-center",
        duration: 2000,
        className: "bg-blue-50 text-blue-600 border border-blue-200",
        icon: <CheckCircle className="h-5 w-5 text-blue-500" />
      });
    }
  };

  const handleEditItem = (itemId: string) => {
    const item = currentTrip?.items.find(item => item.id === itemId);

    if (item) {
      setItemName(item.name);
      setItemCategory(item.category || "");
      setItemAssignedTo(item.assignedTo || "");
      setItemQuantity(item.quantity.toString());
      setItemNotes(item.notes || "");
      setItemToEdit(itemId);
      setIsEditMode(true);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      setItemToDelete(null);
      toast.error("Item removed from trip", {
        position: "top-center",
        duration: 2000,
        className: "bg-red-50 text-red-600 border border-red-200",
        icon: <Trash2 className="h-5 w-5 text-red-500" />
      });
    }
  };

  const handleToggleItemPacked = (itemId: string) => {
    toggleItemPacked(itemId);
  };

  const resetItemForm = () => {
    setItemName("");
    setItemCategory("");
    setItemAssignedTo("");
    setItemQuantity("1");
    setItemNotes("");
    setItemToEdit(null);
    setIsEditMode(false);
  };

  const getFilteredItems = () => {
    if (!currentTrip) return [];

    let filteredItems = [...currentTrip.items];

    // Filter by tab
    if (activeTab === "packed") {
      filteredItems = filteredItems.filter(item => item.isPacked);
    } else if (activeTab === "unpacked") {
      filteredItems = filteredItems.filter(item => !item.isPacked);
    } else if (activeTab !== "all" && activeTab.startsWith("category-")) {
      const categoryName = activeTab.replace("category-", "");
      filteredItems = filteredItems.filter(item => item.category === categoryName);
    } else if (activeTab !== "all" && activeTab.startsWith("person-")) {
      const personId = activeTab.replace("person-", "");
      filteredItems = filteredItems.filter(item => item.assignedTo === personId);
    }

    // Sort items
    return sortItems(filteredItems, sortBy, sortOrder);
  };

  const calculatePackedPercentage = () => {
    if (!currentTrip || currentTrip.items.length === 0) return 0;

    const packed = currentTrip.items.filter(item => item.isPacked).length;
    return Math.round((packed / currentTrip.items.length) * 100);
  };

  const handleSortChange = (field: "name" | "category" | "assignedTo") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleInlineEdit = (itemId: string, field: string, value: string) => {
    if (!currentTrip) return;
  
    const item = currentTrip.items.find(item => item.id === itemId);
    if (!item) return;
  
    const updatedItem = {
      ...item,
      [field]: value.trim()
    };
  
    updateItem(updatedItem);
    setEditingItem(null);
    toast.success(`Updated ${field}`, {
      position: "top-center",
      duration: 2000,
      className: "bg-blue-50 text-blue-600 border border-blue-200",
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />
    });
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;

    // Check for duplicate names (case-insensitive)
    const isDuplicate = currentTrip?.people.some(
      person => person.name.toLowerCase() === newPersonName.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This name already exists", {
        description: "Please use a different name"
      });
      return;
    }

    const newPerson = {
      id: generateId(),
      name: newPersonName.trim(),
      itemCount: 0,
      packedCount: 0
    };

    addPerson(newPerson);
    setItemAssignedTo(newPerson.id);
    setNewPersonName("");
    setShowAddPerson(false);
    toast.success(`Added ${newPerson.name} to the trip`);
  };

  // Add auto-update effect for filtered items
  useEffect(() => {
    const filteredItems = getFilteredItems();
    const packedPercentage = calculatePackedPercentage();
  }, [currentTrip?.items, activeTab, sortBy, sortOrder]);

  if (!currentTrip) {
    return null;
  }

  const filteredItems = getFilteredItems();
  const packedPercentage = calculatePackedPercentage();

  return (
    <div className="space-y-4 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold mx-3">{t('items')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetItemForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('addItems')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditMode ? `Edit ${t('items')}` : `Add ${t('items')}`}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="itemName" className="text-sm font-medium block">
                  {t('name')}
                </label>
                <Input
                  id="itemName"
                  placeholder={t('enterItemName')}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="itemCategory" className="text-sm font-medium block">
                  {t('category')}
                </label>
                {!showAddCategory ? (
                  <div className="flex gap-2">
                    <Select value={itemCategory} onValueChange={setItemCategory}>
                      <SelectTrigger id="itemCategory">
                        <SelectValue placeholder={t('selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {currentTrip.categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => setShowAddCategory(true)}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('newCategoryName')}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddCategory} disabled={!newCategory.trim()}>
                      {t('add')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                      {t('cancel')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="itemAssignedTo" className="text-sm font-medium block">
                  {t('assignedTo')}
                </label>
                {!showAddPerson ? (
                  <div className="flex gap-2">
                    <Select value={itemAssignedTo} onValueChange={setItemAssignedTo}>
                      <SelectTrigger id="itemAssignedTo">
                        <SelectValue placeholder={t('assignToSomeone')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">{t('unassigned')}</SelectItem>
                        {currentTrip.people.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => setShowAddPerson(true)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('enterName')}
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddPerson();
                        } else if (e.key === 'Escape') {
                          setShowAddPerson(false);
                          setNewPersonName("");
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddPerson} disabled={!newPersonName.trim()}>
                      {t('add')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowAddPerson(false);
                      setNewPersonName("");
                    }}>
                      {t('cancel')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="itemQuantity" className="text-sm font-medium block">
                  {t('quantity')}
                </label>
                <Input
                  id="itemQuantity"
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="itemNotes" className="text-sm font-medium block">
                  {t('notes')}
                </label>
                <Input
                  id="itemNotes"
                  placeholder={t('addNotesOrDetails')}
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetItemForm();
                setIsDialogOpen(false);
              }}>
                {t('cancel')}
              </Button>
              <Button onClick={handleAddOrUpdateItem} disabled={!itemName.trim()}>
                {isEditMode ? t('updateItem') : t('addItem')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {currentTrip.items.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow-sm transition-all duration-200">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('noItemsAddedYet')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('startAddingItems')}
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addItem')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    packedPercentage === 100 ? "bg-green-500" :
                    packedPercentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${packedPercentage}%` }}
                />
              </div>
              <span className="text-sm">{packedPercentage}% {t('packed')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}>
                <Filter className="h-4 w-4 mr-1" />
                {t(sortOrder === "asc" ? "sortAscending" : "sortDescending")}
              </Button>
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">{t('allItems')}</TabsTrigger>
              <TabsTrigger value="unpacked">{t('notPacked')}</TabsTrigger>
              <TabsTrigger value="packed">{t('packed')}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <Card className="bg-white transition-all duration-500 hover:shadow-lg rounded-lg animate-pulse-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md">{t('items')}</CardTitle>
                </CardHeader>
                <CardContent className="transition-all duration-300 hover:bg-gray-50/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]" />
                        <TableHead className="cursor-pointer" onClick={() => handleSortChange("name")}>
                          {t('item')} {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSortChange("category")}>
                          {t('category')} {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSortChange("assignedTo")}>
                          {t('assignedTo')} {sortBy === "assignedTo" && (sortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead className="w-[100px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => {
                        const assignedPerson = currentTrip.people.find(
                          (person) => person.id === item.assignedTo
                        );

                        return (
                          <TableRow key={item.id} className="group transition-all duration-300 hover:bg-gray-50/80">
                            <TableCell>
                              <Checkbox
                                checked={item.isPacked}
                                onCheckedChange={() => handleToggleItemPacked(item.id)}
                                className="transition-opacity duration-200 opacity-70 group-hover:opacity-100"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {editingItem === item.id ? (
                                <Input
                                  autoFocus
                                  defaultValue={item.name}
                                  className="h-8 w-full focus:ring-2 focus:ring-primary/20"
                                  onBlur={(e) => handleInlineEdit(item.id, 'name', e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleInlineEdit(item.id, 'name', e.currentTarget.value);
                                    } else if (e.key === 'Escape') {
                                      setEditingItem(null);
                                    }
                                  }}
                                />
                              ) : (
                                <div 
                                  className="cursor-pointer px-2 py-1 rounded transition-all duration-200 hover:bg-primary/5 group relative"
                                  onClick={() => setEditingItem(item.id)}
                                >
                                  <span className="relative">
                                    {item.name}
                                    {item.quantity > 1 && (
                                      <span className="ml-2 text-sm text-muted-foreground">
                                        ({t('quantity')}: {item.quantity})
                                      </span>
                                    )}
                                    {item.notes && (
                                      <div className="text-xs text-gray-500 mt-0.5">{item.notes}</div>
                                    )}
                                    <span className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Pencil className="h-3 w-3 text-muted-foreground" />
                                    </span>
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {item.category || t('noneCategory')}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {assignedPerson?.name || t('unassigned')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditItem(item.id)}
                                  aria-label={t('editItem')}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0"
                                      onClick={() => setItemToDelete(item.id)}
                                      aria-label={t('removeItem')}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>{t('removeItem')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Alert>
                                        <AlertDescription>
                                          {t('areYouSureYouWantToRemove')} <strong>{item.name}</strong>?
                                        </AlertDescription>
                                      </Alert>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setItemToDelete(null)}>
                                        {t('cancel')}
                                      </Button>
                                      <Button variant="destructive" onClick={handleDeleteItem}>
                                        {t('remove')}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
