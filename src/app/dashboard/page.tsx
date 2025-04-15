"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      // Simulate loading time for data fetching
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <main>
      <DashboardLayout />
    </main>
  );
} 