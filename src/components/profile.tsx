"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  LogOut, 
  Package, 
  Users2, 
  Calendar,
  Backpack
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EditProfileDialog } from "./profile/edit-profile-dialog";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useTrip } from "@/lib/trip-context";

export function Profile() {
  const router = useRouter();
  const { user, logout, setUser } = useAuth();
  const { trips } = useTrip();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/dashboard");
  };

  const handleProfileUpdate = (data: { name: string; email: string; avatar: string }) => {
    setUser({
      ...user!,
      ...data
    });
  };

  // Calculate real-time stats
  const tripsCreated = trips.length;
  const itemsPacked = trips.reduce((total, trip) => 
    total + trip.items.filter(item => item.isPacked).length, 0
  );
  const peopleCollaborated = trips.reduce((total, trip) => 
    total + trip.people.length, 0
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="container mx-auto">
        <header className="mb-8 w-full">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center">
              <h1 className="text-5xl font-bold flex items-center text-blue-900">
                <Backpack className="h-14 w-14 mr-4 text-blue-600" />
                PackTogether
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push("/dashboard")} 
                title="Go to Dashboard"
                className="bg-white/80 backdrop-blur-sm border-blue-200/30 hover:bg-white/90"
              >
                <Backpack className="h-5 w-5 text-blue-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                title="Logout"
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
              >
                <LogOut className="h-5 w-5 text-blue-600" />
              </Button>
            </div>
          </div>
          <p className="text-blue-800/80 text-center mt-2 text-lg">
            Your Personal Packing Command Center
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-blue-900">Profile</CardTitle>
                  <EditProfileDialog user={user} onUpdate={handleProfileUpdate} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-8">
                  <Avatar className="h-24 w-24 border-4 border-blue-200/30">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-blue-400 to-blue-600">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-blue-900">{user.name}</h2>
                    <p className="text-blue-800/80 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-xl h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-blue-900">Activity Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-900">Trips Created</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{tripsCreated}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-900">Items Packed</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{itemsPacked}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <Users2 className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-900">Collaborators</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{peopleCollaborated}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 