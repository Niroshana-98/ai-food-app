'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, ChefHat, Sparkles, ArrowRight, Clock, Users } from 'lucide-react'

interface DishSuggestionScreenProps {
  onNext: () => void
}

export function DishSuggestionScreen({ onNext }: DishSuggestionScreenProps) {
  const [cuisine, setCuisine] = useState('')
  const [location, setLocation] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showSuggestion, setShowSuggestion] = useState(false)

  const dietaryTags = [
    'Vegan', 'Vegetarian', 'Gluten-Free', 'Spicy', 'Comfort Food', 
    'Healthy', 'Quick Bite', 'Fine Dining', 'Street Food', 'Dessert'
  ]

  const moodTags = [
    'Adventurous', 'Nostalgic', 'Energetic', 'Relaxed', 'Celebratory', 'Cozy'
  ]

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleGetSuggestion = () => {
    setShowSuggestion(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b p-6">
        <div className="container mx-auto flex items-center">
          <ChefHat className="h-8 w-8 text-orange-600 mr-3" />
          <h1 className="text-2xl font-bold">DishAI Recommendations</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {!showSuggestion ? (
            <Card className="p-8">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl mb-4">Tell us what you're craving</CardTitle>
                <p className="text-gray-600">Help our AI understand your preferences for the perfect dish recommendation</p>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Cuisine & Location */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="cuisine" className="text-lg font-medium mb-3 block">
                      Preferred Cuisine
                    </Label>
                    <Input
                      id="cuisine"
                      placeholder="e.g., Italian, Chinese, Mexican..."
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="text-lg py-3"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="text-lg font-medium mb-3 block">
                      <MapPin className="inline h-5 w-5 mr-2" />
                      Your Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="City, ZIP code, or address"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="text-lg py-3"
                    />
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div>
                  <Label className="text-lg font-medium mb-4 block">Dietary Preferences</Label>
                  <div className="flex flex-wrap gap-3">
                    {dietaryTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        className={`px-4 py-2 cursor-pointer transition-colors ${
                          selectedTags.includes(tag) 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'hover:bg-orange-100'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Mood Tags */}
                <div>
                  <Label className="text-lg font-medium mb-4 block">What's your mood?</Label>
                  <div className="flex flex-wrap gap-3">
                    {moodTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "secondary"}
                        className={`px-4 py-2 cursor-pointer transition-colors ${
                          selectedTags.includes(tag) 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'hover:bg-blue-100'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes" className="text-lg font-medium mb-3 block">
                    Anything else? (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific ingredients, allergies, or special requests..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  onClick={handleGetSuggestion}
                  size="lg" 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-4"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get AI Recommendation
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* AI Suggestion Result */
            <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Perfect Match Found!</h2>
                  <p className="text-orange-100">Based on your preferences, here's what we recommend:</p>
                </div>
              </Card>

              <Card className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">Chicken Tikka Masala</h3>
                  <div className="flex justify-center space-x-4 text-sm text-gray-600 mb-6">
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />30 mins</span>
                    <span className="flex items-center"><Users className="h-4 w-4 mr-1" />Serves 2-3</span>
                    <span className="flex items-center"><ChefHat className="h-4 w-4 mr-1" />Indian Cuisine</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-3">Why this dish is perfect for you:</h4>
                  <p className="text-gray-700 leading-relaxed">
                    This creamy, aromatic Indian classic combines tender chicken in a rich tomato-based sauce with warming spices. 
                    It's the perfect comfort food that matches your craving for something flavorful and satisfying. The dish offers 
                    a beautiful balance of spices without being too overwhelming, making it ideal for your current mood.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  <Badge variant="secondary">Comfort Food</Badge>
                  <Badge variant="secondary">Spicy</Badge>
                  <Badge variant="secondary">Indian</Badge>
                  <Badge variant="secondary">Creamy</Badge>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={onNext}
                    size="lg" 
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Find Restaurants
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowSuggestion(false)}
                  >
                    Try Again
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
