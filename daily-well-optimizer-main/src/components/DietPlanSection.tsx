import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Coffee, Sun, Moon, Cookie } from 'lucide-react';

interface DietPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

interface DietPlanSectionProps {
  dietPlan: DietPlan;
}

export const DietPlanSection = ({ dietPlan }: DietPlanSectionProps) => {
  const meals = [
    {
      title: 'Breakfast',
      icon: Coffee,
      content: dietPlan.breakfast,
      time: '7:00 - 9:00 AM'
    },
    {
      title: 'Lunch', 
      icon: Sun,
      content: dietPlan.lunch,
      time: '12:00 - 2:00 PM'
    },
    {
      title: 'Dinner',
      icon: Moon,
      content: dietPlan.dinner,
      time: '7:00 - 9:00 PM'
    },
    {
      title: 'Snacks',
      icon: Cookie,
      content: dietPlan.snacks,
      time: 'Between meals'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-green-500" />
          Personalized Diet Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {meals.map((meal) => {
            const Icon = meal.icon;
            return (
              <div key={meal.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold">{meal.title}</h4>
                  <span className="text-xs text-muted-foreground">({meal.time})</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed">{meal.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};