"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrip } from "@/lib/trip-context";
import { Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function TemplateManager() {
  const { templates, createFromTemplate, deleteTemplate, saveAsTemplate, currentTrip } = useTrip();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateFromTemplate = (template: any) => {
    createFromTemplate(template);
    setIsOpen(false);
    toast.success("Trip created from template!");
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteTemplate(templateId);
    toast.success("Template deleted!");
  };

  const handleSaveAsTemplate = () => {
    if (!currentTrip) return;
    saveAsTemplate(currentTrip);
    toast.success("Trip saved as template!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-blue-200/30 hover:bg-white/90">
          <Package className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Templates</DialogTitle>
          <DialogDescription>
            Manage your packing list templates here. You can create new trips from templates or save current trips as templates.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {currentTrip && (
            <Button
              onClick={handleSaveAsTemplate}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Save Current Trip as Template
            </Button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-white/80 backdrop-blur-sm border-blue-200/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {template.items.length} items
                    </p>
                    <Button
                      onClick={() => handleCreateFromTemplate(template)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Create Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No templates available. Save a trip as a template to get started.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="bg-white/80 backdrop-blur-sm border-blue-200/30 hover:bg-white/90"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 