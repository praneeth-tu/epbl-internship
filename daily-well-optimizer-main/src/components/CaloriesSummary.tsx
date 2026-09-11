import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CaloriesSummaryProps {
  totalCalories: number;
}

export const CaloriesSummary = ({ totalCalories }: CaloriesSummaryProps) => {
  // Rough daily calorie recommendations (can be personalized based on user profile)
  const recommendedCalories = 2000;
  const caloriePercentage = Math.min((totalCalories / recommendedCalories) * 100, 100);

  const getCalorieStatus = () => {
    if (totalCalories < recommendedCalories * 0.8) {
      return { status: 'Low', color: 'text-orange-600', description: 'Consider adding more nutritious foods' };
    } else if (totalCalories > recommendedCalories * 1.2) {
      return { status: 'High', color: 'text-red-600', description: 'Consider reducing portion sizes' };
    } else {
      return { status: 'Good', color: 'text-green-600', description: 'Within recommended range' };
    }
  };

  const { status, color, description } = getCalorieStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Calories</CardTitle>
        <CardDescription>Track your caloric intake</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{totalCalories}</span>
          <span className="text-sm text-muted-foreground">/ {recommendedCalories} kcal</span>
        </div>
        
        <Progress value={caloriePercentage} className="w-full" />
        
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${color}`}>Status: {status}</span>
          <span className="text-muted-foreground">{Math.round(caloriePercentage)}%</span>
        </div>
        
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {totalCalories > 0 && (
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="text-center">
              <div className="font-medium">Breakfast</div>
              <div>~25%</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Lunch</div>
              <div>~35%</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Dinner</div>
              <div>~30%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};