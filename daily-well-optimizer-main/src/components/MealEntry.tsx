import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  category: string;
}

interface MealData {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

interface MealEntryProps {
  meals: MealData;
  onMealChange: (mealType: keyof MealData, value: string) => void;
  onCaloriesChange: (calories: number) => void;
}

interface AddedFood {
  food: Food;
  quantity: number;
  calories: number;
}

export const MealEntry = ({ meals, onMealChange, onCaloriesChange }: MealEntryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedFoods, setAddedFoods] = useState<Record<keyof MealData, AddedFood[]>>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });
  const [selectedMeal, setSelectedMeal] = useState<keyof MealData>('breakfast');

  useEffect(() => {
    // Calculate total calories whenever added foods change
    const totalCalories = Object.values(addedFoods)
      .flat()
      .reduce((sum, item) => sum + item.calories, 0);
    onCaloriesChange(totalCalories);

    // Update meal strings
    Object.entries(addedFoods).forEach(([mealType, foods]) => {
      const mealString = foods
        .map(item => `${item.food.name} (${item.quantity}g - ${item.calories}kcal)`)
        .join(', ');
      onMealChange(mealType as keyof MealData, mealString);
    });
  }, [addedFoods, onCaloriesChange, onMealChange]);

  const searchFoods = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('id, name, calories_per_100g, category')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const addFoodToMeal = (food: Food, quantity: number) => {
    const calories = Math.round((food.calories_per_100g * quantity) / 100);
    const newItem: AddedFood = { food, quantity, calories };

    setAddedFoods(prev => ({
      ...prev,
      [selectedMeal]: [...prev[selectedMeal], newItem]
    }));

    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFoodFromMeal = (mealType: keyof MealData, index: number) => {
    setAddedFoods(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  const mealTabs: { key: keyof MealData; label: string }[] = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snacks', label: 'Snacks' }
  ];

  return (
    <div className="space-y-4">
      {/* Meal Type Selector */}
      <div className="flex space-x-2">
        {mealTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={selectedMeal === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMeal(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Food Search */}
      <div className="space-y-2">
        <Label htmlFor="food-search">Search and add foods</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="food-search"
            placeholder="Search for foods (e.g., apple, chicken, rice)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                {searchResults.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {food.calories_per_100g} kcal/100g
                        <Badge variant="secondary" className="ml-2">{food.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="grams"
                        min="1"
                        max="1000"
                        className="w-20"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const quantity = parseInt((e.target as HTMLInputElement).value);
                            if (quantity > 0) {
                              addFoodToMeal(food, quantity);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector(`input[placeholder="grams"]`) as HTMLInputElement;
                          const quantity = parseInt(input?.value || '100');
                          addFoodToMeal(food, quantity);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Added Foods for Current Meal */}
      <div className="space-y-2">
        <Label>Added to {mealTabs.find(t => t.key === selectedMeal)?.label}</Label>
        {addedFoods[selectedMeal].length === 0 ? (
          <p className="text-sm text-muted-foreground">No foods added yet</p>
        ) : (
          <div className="space-y-2">
            {addedFoods[selectedMeal].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div>
                  <div className="font-medium">{item.food.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity}g - {item.calories} kcal
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFoodFromMeal(selectedMeal, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Entry Option */}
      <div className="space-y-2">
        <Label htmlFor={`${selectedMeal}-manual`}>Or describe manually</Label>
        <Textarea
          id={`${selectedMeal}-manual`}
          placeholder={`Describe your ${selectedMeal} (e.g., 2 slices of bread with butter)`}
          value={meals[selectedMeal]}
          onChange={(e) => onMealChange(selectedMeal, e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
};