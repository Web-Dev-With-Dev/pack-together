"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useTrip } from "@/lib/trip-context";
import { useLanguage } from "@/lib/language-context";
import { generateId, formatProgress, getProgressColor } from "@/lib/utils";
import { PlusCircle, UserPlus, Trash2, Users, Pencil } from "lucide-react";
import { toast } from "sonner";

export function PeopleManager() {
  const {
    currentTrip,
    addPerson,
    deletePerson,
    getPersonItems,
    getPersonProgress,
    updatePerson
  } = useTrip();
  const { t } = useLanguage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [personName, setPersonName] = useState("");
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<string | null>(null);

  const resetForm = () => {
    setPersonName("");
    setPersonToEdit(null);
    setIsEditMode(false);
    setIsDialogOpen(false);
    setEditingPerson(null);
  };

  const handleAddPerson = () => {
    if (!personName.trim()) return;

    // Check for duplicate names (case-insensitive)
    const isDuplicate = currentTrip?.people.some(
      person => person.name.toLowerCase() === personName.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This name already exists", {
        description: "Please use a different name"
      });
      return;
    }

    const newPerson = {
      id: generateId(),
      name: personName,
      itemCount: 0,
      packedCount: 0
    };

    addPerson(newPerson);
    toast.success(`Added ${personName} to the trip`);
    resetForm();
  };

  const handleEditPerson = (person: { id: string; name: string }) => {
    setPersonName(person.name);
    setPersonToEdit(person.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleUpdatePerson = () => {
    if (!personToEdit || !personName.trim()) return;

    // Check for duplicate names, excluding the current person being edited
    const isDuplicate = currentTrip?.people.some(
      person => 
        person.id !== personToEdit && 
        person.name.toLowerCase() === personName.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This name already exists", {
        description: "Please use a different name"
      });
      return;
    }

    const updatedPerson = {
      id: personToEdit,
      name: personName,
      itemCount: currentTrip?.people.find(p => p.id === personToEdit)?.itemCount || 0,
      packedCount: currentTrip?.people.find(p => p.id === personToEdit)?.packedCount || 0
    };

    updatePerson(updatedPerson);
    toast.success(`Updated ${personName}'s information`);
    resetForm();
  };

  const handleDeletePerson = (personId: string) => {
    deletePerson(personId);
    setPersonToDelete(null);
  };

  const handleInlineEdit = (personId: string, field: string, value: string) => {
    if (field === 'name') {
      // Check for duplicate names when inline editing
      const isDuplicate = currentTrip?.people.some(
        person => 
          person.id !== personId && 
          person.name.toLowerCase() === value.trim().toLowerCase()
      );

      if (isDuplicate) {
        toast.error("This name already exists", {
          description: "Please use a different name"
        });
        return;
      }
    }

    const person = currentTrip?.people.find(p => p.id === personId);
    if (!person) return;

    const updatedPerson = {
      ...person,
      [field]: value.trim()
    };

    updatePerson(updatedPerson);
    setEditingPerson(null);
    
    if (field === 'name') {
      toast.success(`Updated name to ${value.trim()}`);
    }
  };

  if (!currentTrip) return null;

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-black hover:bg-black/90 text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            {t('members')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? `Edit ${t('member')}` : `Add ${t('member')}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={t('enterName')}
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              {t('cancel')}
            </Button>
            <Button onClick={isEditMode ? handleUpdatePerson : handleAddPerson}>
              {isEditMode ? t('update') : t('add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentTrip.people.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('noItemsAddedYet')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('startAddingItems')}
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('add')} {t('member')}
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md">{t('members')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('items')}</TableHead>
                  <TableHead>{t('progress')}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrip.people.map((person) => {
                  const { packed, total, percentage } = getPersonProgress(person.id);
                  const progressColor = getProgressColor(percentage);

                  return (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium w-[800px]">
                        <Card key={person.id} className="group transition-all duration-300 hover:shadow-lg w-full">
                          <CardHeader className="pb-1 pt-1">
                            <CardTitle className="text-base">
                              {editingPerson === person.id ? (
                                <Input
                                  autoFocus
                                  defaultValue={person.name}
                                  className="h-8 w-full focus:ring-2 focus:ring-primary/20"
                                  onBlur={(e) => handleInlineEdit(person.id, 'name', e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleInlineEdit(person.id, 'name', e.currentTarget.value);
                                    } else if (e.key === 'Escape') {
                                      setEditingPerson(null);
                                    }
                                  }}
                                />
                              ) :
                                <div 
                                  className="cursor-pointer px-2 py-1 -mx-2 rounded transition-all duration-200 hover:bg-primary/5 group-hover:bg-primary/5 group relative"
                                  onClick={() => setEditingPerson(person.id)}
                                >
                                  <span className="relative">
                                    {person.name}
                                    <span className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Pencil className="h-3 w-3 text-muted-foreground" />
                                    </span>
                                  </span>
                                </div>
                              }
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="transition-colors duration-300 hover:bg-gray-50/50 pb-1 pt-0">
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${progressColor}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{formatProgress(packed, total)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </TableCell>
                      <TableCell>{person.itemCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${progressColor}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{formatProgress(packed, total)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditPerson(person)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                                onClick={() => setPersonToDelete(person.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Remove {t('member')}</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <Alert>
                                  <AlertDescription>
                                    Are you sure you want to remove <strong>{person.name}</strong>?
                                    {person.itemCount > 0 && (
                                      <p className="mt-2">
                                        Their {person.itemCount} {t('items')} will be unassigned.
                                      </p>
                                    )}
                                  </AlertDescription>
                                </Alert>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setPersonToDelete(null)}>
                                  {t('cancel')}
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeletePerson(person.id)}
                                >
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
      )}
    </div>
  );
}
