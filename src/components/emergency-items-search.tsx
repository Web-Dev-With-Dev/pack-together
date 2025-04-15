"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const SWIGGY_SEARCH_URL = "https://www.swiggy.com/instamart/search?query=";

const POPULAR_SEARCHES = [
  "Medicine",
  "First Aid",
  "Bandages",
  "Pain Relief",
  "Antiseptic",
  "Face Masks",
  "Sanitizer",
  "Dettol",
  "Crocin",
  "Cotton"
];

export function EmergencyItemsSearch() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    window.open(SWIGGY_SEARCH_URL + encodeURIComponent(searchQuery), '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">{t("emergency.quickItems")} ⚡</h2>
        <span className="text-muted-foreground block">
          {t("emergency.searchSwiggy")}
        </span>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t("emergency.searchAnything")}
            className="pl-10 pr-24" // Added right padding for button
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2"
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
          >
            <span className="text-xl">🛵</span>
            {t("emergency.search")}
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Categories */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">{t("emergency.popularSearches")}</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <Button
                key={term}
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setSearchQuery(term);
                  handleSearch();
                }}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 