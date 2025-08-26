'use client';

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

interface HeroProps {
  onGetRecommendations: () => void;
}

export function Hero({ onGetRecommendations }: HeroProps) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">{siteConfig.heroTitle}</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{siteConfig.tagline}</p>
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input placeholder="I'm craving something..." className="pl-10 py-3 text-lg" />
        </div>
      </div>
      <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
        onClick={onGetRecommendations}>
        Get AI Recommendations
      </Button>
    </div>
  );
}
