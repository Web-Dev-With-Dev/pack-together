"use client";

import { useTrip } from "@/lib/trip-context";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { TripSelector } from "@/components/trip-selector";
import { PeopleManager } from "@/components/people-manager";
import { ItemsManager } from "@/components/items-manager";
import { LanguageSelector } from "@/components/language-selector";
import { Backpack, Users, User, FileDown, Mail, Github, CheckCircle, Plane, Calendar, Package, ArrowRight, Plus, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Input } from "@/components/ui/input";
import { EmergencyItemsSearch } from "./emergency-items-search";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function DashboardLayout() {
  const { currentTrip } = useTrip();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    if (currentTrip) {
      toast.success(`Loaded trip: ${currentTrip.name}`, {
        position: "top-center",
        duration: 2000,
        className: "glass-panel border border-green-200/50 text-lg font-medium",
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        style: {
          animation: 'fade-in-scale 0.3s ease-out',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      });
    }
  }, [currentTrip?.id]);

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleExportList = () => {
    if (!currentTrip) return;

    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Helper function to add text and update y position
    const addText = (text: string, fontSize = 12, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(text, margin, yPos);
      yPos += lineHeight;
    };

    // Add title
    addText(`PACKING LIST: ${currentTrip.name}`, 16, true);
    yPos += 5;

    // Trip details
    addText(`Date: ${currentTrip.startDate} - ${currentTrip.endDate}`);
    addText(`Total Items: ${currentTrip.items.length}`);
    const packedItems = currentTrip.items.filter(item => item.isPacked).length;
    addText(`Packed Items: ${packedItems} (${Math.round((packedItems / currentTrip.items.length) * 100)}%)`);
    yPos += 5;

    // People overview
    addText('PEOPLE OVERVIEW:', 14, true);
    currentTrip.people.forEach(person => {
      const personItems = currentTrip.items.filter(item => item.assignedTo === person.id);
      const personPackedItems = personItems.filter(item => item.isPacked).length;
      const percentage = personItems.length > 0 
        ? Math.round((personPackedItems / personItems.length) * 100) 
        : 0;
      addText(`${person.name}: ${personPackedItems}/${personItems.length} items packed (${percentage}%)`);
    });
    yPos += 5;

    // Categories overview
    const categories = [...new Set(currentTrip.items.map(item => item.category))].filter(Boolean);
    if (categories.length > 0) {
      addText('CATEGORIES:', 14, true);
      categories.forEach(category => {
        const categoryItems = currentTrip.items.filter(item => item.category === category);
        const categoryPackedItems = categoryItems.filter(item => item.isPacked).length;
        const percentage = Math.round((categoryPackedItems / categoryItems.length) * 100);
        addText(`${category}: ${categoryPackedItems}/${categoryItems.length} items packed (${percentage}%)`);
      });
      yPos += 5;
    }

    // Detailed item list
    addText('DETAILED ITEM LIST:', 14, true);
    currentTrip.items.forEach(item => {
      const assignedTo = currentTrip.people.find(p => p.id === item.assignedTo)?.name || 'Unassigned';
      const status = item.isPacked ? '✓' : '✗';
      const itemText = `${status} ${item.name} (${assignedTo})${item.notes ? ` - Note: ${item.notes}` : ''}`;
      
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
      }
      
      addText(itemText);
    });

    // Save the PDF
    doc.save(`${currentTrip.name}-packing-list.pdf`);

    toast.success("Packing list exported as PDF!", {
      position: "top-center",
      duration: 2000,
      className: "glass-panel border border-green-200/50 text-lg font-medium",
      icon: <FileDown className="h-6 w-6 text-green-500" />,
      style: {
        animation: 'fade-in-scale 0.3s ease-out',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }
    });
  };

  const handleSubscribe = () => {
    if (!email.trim()) {
      toast.error("Please enter your email address", {
        position: "top-center",
        duration: 2000,
        className: "glass-panel border border-red-200/50 text-lg font-medium",
        icon: <Mail className="h-6 w-6 text-red-500" />,
        style: {
          animation: 'fade-in-scale 0.3s ease-out',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      });
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        duration: 2000,
        className: "glass-panel border border-red-200/50 text-lg font-medium",
        icon: <Mail className="h-6 w-6 text-red-500" />,
        style: {
          animation: 'fade-in-scale 0.3s ease-out',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      });
      return;
    }

    toast.success("Successfully subscribed to our newsletter!", {
      position: "top-center",
      duration: 2000,
      className: "glass-panel border border-green-200/50 text-lg font-medium",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      style: {
        animation: 'fade-in-scale 0.3s ease-out',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }
    });
    setEmail(""); // Clear the input after successful subscription
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 relative">
        {/* Top Navigation */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <LanguageSelector />
          <Link href="/profile">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full p-3 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg border border-blue-200/30 group"
              onClick={handleProfileClick}
            >
              <User className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full p-3 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg border border-blue-200/30 group"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform" />
          </Button>
        </div>

        {/* Header */}
        <header className="mb-8 w-full mt-2">
          <div className="flex items-start justify-center w-full max-w-3xl mx-auto glass-panel p-6 animate-float relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white/30 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="absolute inset-0 backdrop-blur-[2px]"></div>
            
            {/* Animated Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="animate-fly-across">
                <Plane className="h-6 w-6 text-blue-600/70 transform -rotate-12 animate-float-plane" />
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-100/50 to-blue-200/50 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <h1 className="relative text-4xl font-bold flex items-center font-display tracking-tight group">
                  <div className="relative transform-gpu transition-transform duration-500 hover:scale-110">
                    <Backpack className="h-10 w-10 mr-3 text-blue-600 animate-slide-in-left hover:text-blue-700 transition-colors duration-300" />
                    <div className="absolute -inset-2 bg-blue-100 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition duration-500"></div>
                  </div>
                  <span className="animate-slide-in-right text-blue-900 hover:text-blue-800 transition-colors duration-300 transform-gpu hover:scale-105">
                    {t('app.title')}
                  </span>
                </h1>
              </div>
              <p className="text-base mt-2 font-medium tracking-wide max-w-md mx-auto text-balance animate-fade-in-delayed relative">
                <span className="text-blue-800/80 hover:text-blue-900 transition-colors duration-300">
                  {t('app.description')}
                </span>
                <div className="absolute -inset-1 bg-blue-50 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
              </p>
            </div>
          </div>
        </header>

        <TripSelector />

        {currentTrip && (
          <div className="mt-8 animate-fade-in-up">
            <div className="mb-8">
              <div className="flex flex-col gap-6 glass-panel p-6 hover:shadow-xl transition-all duration-500">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-3xl font-bold text-blue-900 font-display tracking-tight">{currentTrip.name}</h1>
                  <Button 
                    variant="default" 
                    onClick={handleExportList} 
                    className="bg-blue-600 hover:bg-blue-700 text-white transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                  >
                    <FileDown className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform" />
                    {t('export.list')}
                  </Button>
                </div>

                {/* Trip Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50 backdrop-blur-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('members')}</p>
                      <p className="text-xl font-semibold text-blue-900">{currentTrip.people.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50 backdrop-blur-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('packed')}</p>
                      <p className="text-xl font-semibold text-blue-900">
                        {currentTrip.items.filter(item => item.isPacked).length}/{currentTrip.items.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50 backdrop-blur-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('dates')}</p>
                      <p className="text-xl font-semibold text-blue-900">
                        {currentTrip.startDate} - {currentTrip.endDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Packing Progress</span>
                    <span className="text-sm font-medium text-blue-600">
                      {Math.round((currentTrip.items.filter(item => item.isPacked).length / currentTrip.items.length) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(currentTrip.items.filter(item => item.isPacked).length / currentTrip.items.length) * 100} 
                    className="h-2 bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden animate-fade-in">
              <Tabs defaultValue="items" className="glass-panel p-4 hover:shadow-xl transition-all duration-500">
                <TabsList className="w-full">
                  <TabsTrigger value="items" className="flex-1 text-blue-900 font-medium">
                    <Backpack className="h-4 w-4 mr-1" /> {t('items')}
                  </TabsTrigger>
                  <TabsTrigger value="people" className="flex-1 text-blue-900 font-medium">
                    <Users className="h-4 w-4 mr-1" /> {t('people')}
                  </TabsTrigger>
                  <TabsTrigger value="emergency" className="flex-1 text-blue-900 font-medium">
                    <span className="flex items-center">⚡ {t('emergency.quickItems')}</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="items" className="space-y-4 py-4">
                  <ItemsManager />
                </TabsContent>
                <TabsContent value="people" className="space-y-4 py-4">
                  <PeopleManager />
                </TabsContent>
                <TabsContent value="emergency" className="space-y-4 py-4">
                  <EmergencyItemsSearch />
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop View */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-6">
              <div className="md:col-span-6 lg:col-span-5 glass-panel p-6 hover:shadow-xl transition-all duration-500">
                <PeopleManager />
              </div>
              <div className="md:col-span-6 lg:col-span-7 glass-panel p-6 hover:shadow-xl transition-all duration-500">
                <Tabs defaultValue="items" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="items" className="text-blue-900">
                      <Backpack className="h-4 w-4 mr-1" /> {t('items')}
                    </TabsTrigger>
                    <TabsTrigger value="emergency" className="text-blue-900">
                      <span className="flex items-center">⚡ {t('emergency.quickItems')}</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="items" className="space-y-4">
                    <ItemsManager />
                  </TabsContent>
                  <TabsContent value="emergency" className="space-y-4">
                    <EmergencyItemsSearch />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 border-t border-blue-200/30 w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] animate-fade-in backdrop-blur-sm bg-white/30">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3 hover:transform hover:-translate-y-1 transition-all duration-300 p-4 rounded-lg hover:shadow-lg glass-panel group">
                <h3 className="text-lg font-semibold flex items-center">
                  <Backpack className="h-5 w-5 mr-2 animate-bounce-slow" />
                  <span className="text-blue-900">{t('app.title')}</span>
                </h3>
                <p className="text-sm text-blue-800/80">
                  {t('footer.about')}
                </p>
              </div>

              <div className="space-y-3 hover:transform hover:-translate-y-1 transition-all duration-300 p-4 rounded-lg hover:shadow-lg glass-panel group">
                <h4 className="font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 group-hover:animate-bounce-slow" />
                  <span className="text-blue-900">{t('footer.contact')}</span>
                </h4>
                <ul className="space-y-2 text-sm text-blue-800/80">
                  <li className="flex items-center transform hover:translate-x-1 transition-transform duration-200">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href="mailto:gondaliyadev71@gmail.com" className="hover:text-blue-900 transition-colors">
                      gondaliyadev71@gmail.com
                    </a>
                  </li>
                  <li className="flex items-center transform hover:translate-x-1 transition-transform duration-200">
                    <Github className="h-4 w-4 mr-2" />
                    <a href="https://github.com/Web-Dev-With-Dev" className="hover:text-blue-900 transition-colors">
                      web-dev-with-dev
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 hover:transform hover:-translate-y-1 transition-all duration-300 p-4 rounded-lg hover:shadow-lg glass-panel group">
                <h4 className="font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 group-hover:animate-bounce-slow" />
                  <span className="text-blue-900">{t('footer.newsletter')}</span>
                </h4>
                <p className="text-sm text-blue-800/80">
                  {t('footer.newsletter.description')}
                </p>
                <div className="flex gap-2 transform hover:translate-y-[-2px] transition-transform duration-200">
                  <Input 
                    type="email" 
                    placeholder={t('footer.email.placeholder')}
                    className="max-w-[200px] focus:ring-2 focus:ring-blue-200 bg-white/50 backdrop-blur-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button 
                    variant="default" 
                    className="bg-blue-600 hover:bg-blue-700 text-white transform hover:translate-y-[-1px] hover:shadow-lg transition-all duration-300 group"
                    onClick={handleSubscribe}
                  >
                    {t('footer.subscribe')}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-200/30">
              <p className="text-center text-sm text-blue-800/80 hover:text-blue-900 transition-colors duration-200">
                © {new Date().getFullYear()} {t('app.title')}. {t('footer.rights')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
