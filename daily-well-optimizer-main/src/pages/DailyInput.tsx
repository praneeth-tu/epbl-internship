import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MealEntry } from '@/components/MealEntry';
import { CaloriesSummary } from '@/components/CaloriesSummary';
import { generatePredictions, generateTips, generateDietPlan } from '@/utils/predictions';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Profile {
  height_cm: number;
  weight_kg: number;
  bmi: number;
}

interface MealData {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

interface FormData {
  weight: number;
  sleep: number;
  exercise: number;
  water: number;
  yoga: number;
  stress_level: string;
}

const STEPS = [
  { id: 1, title: 'Basic Metrics', description: 'Weight, sleep, and exercise data' },
  { id: 2, title: 'Meals', description: 'What did you eat today?' },
  { id: 3, title: 'Review & Submit', description: 'Review all data before saving' }
];

const DailyInput = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    weight: 0,
    sleep: 0,
    exercise: 0,
    water: 0,
    yoga: 0,
    stress_level: ''
  });
  const [meals, setMeals] = useState<MealData>({
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: ''
  });
  const [totalCalories, setTotalCalories] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Fetch user profile
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('height_cm, weight_kg, bmi')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!data) {
        navigate('/profile-setup');
        return;
      }
      
      setProfile(data);
      setBmi(data.bmi);
      setFormData(prev => ({ ...prev, weight: data.weight_kg }));
    };

    fetchProfile();
  }, [user, navigate]);

  const calculateBMI = (height: number, weight: number) => {
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      return weight / (heightInMeters * heightInMeters);
    }
    return null;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.weight > 0 && formData.sleep > 0 && formData.exercise >= 0 && formData.water > 0;
      case 2:
        return meals.breakfast.trim() !== '' && meals.lunch.trim() !== '' && 
               meals.dinner.trim() !== '' && meals.snacks.trim() !== '';
      default:
        return true;
    }
  };

  const handleFormDataChange = (field: keyof FormData, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [field]: numValue }));
    
    if (field === 'weight' && profile) {
      const newBmi = calculateBMI(profile.height_cm, numValue);
      setBmi(newBmi);
    }
  };

  const handleMealChange = (mealType: keyof MealData, value: string) => {
    setMeals(prev => ({ ...prev, [mealType]: value }));
  };

  const handleCaloriesChange = (calories: number) => {
    setTotalCalories(calories);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      setError('');
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!user || !profile) return;
    
    setIsLoading(true);
    setError('');

    const weight = formData.weight;
    const sleep = formData.sleep;
    const exercise = formData.exercise;
    const water = formData.water;
    const yoga = formData.yoga;
    const stressLevel = formData.stress_level || 'medium';

    if (!weight || !sleep || exercise < 0 || water <= 0) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const newBmi = calculateBMI(profile.height_cm, weight);
    if (!newBmi) {
      setError('Invalid weight value');
      setIsLoading(false);
      return;
    }

    try {
      // Save daily input with upsert and onConflict
      const { error: inputError } = await supabase
        .from('daily_inputs')
        .upsert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          weight_kg: weight,
          bmi: newBmi,
          sleep_hours: sleep,
          exercise_minutes: exercise,
          yoga_minutes: yoga,
          water_glasses: water,
          stress_level: stressLevel,
          meals: meals as any,
          total_calories: totalCalories
        }, {
          onConflict: 'user_id,date'
        });

      if (inputError) {
        setError(inputError.message);
        setIsLoading(false);
        return;
      }

      // Update profile weight and BMI
      await supabase
        .from('profiles')
        .update({
          weight_kg: weight,
          bmi: newBmi
        })
        .eq('user_id', user.id);

      // Generate rule-based predictions
      const predictionInput = {
        bmi: newBmi,
        sleep_hours: sleep,
        exercise_minutes: exercise,
        stress_level: stressLevel,
        water_glasses: water
      };

      const predictions = generatePredictions(predictionInput);
      const tips = generateTips(predictions, predictionInput);
      const dietPlan = generateDietPlan(predictions, predictionInput);

      // Save predictions with upsert and onConflict
      await supabase
        .from('predictions')
        .upsert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          diabetes_risk: predictions.diabetes_risk,
          heart_risk: predictions.heart_risk,
          obesity_risk: predictions.obesity_risk,
          sleep_risk: predictions.sleep_risk,
          risk_levels: predictions.risk_levels,
          tips: tips,
          diet_plan: dietPlan
        }, {
          onConflict: 'user_id,date'
        });

      toast({
        title: "Daily data saved!",
        description: "Your health data has been recorded successfully.",
      });
      
      navigate('/');
    } catch (err) {
      setError('Failed to save data. Please try again.');
    }
    
    setIsLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Basic Metrics</CardTitle>
              <CardDescription>Weight, sleep, exercise, yoga, hydration, and stress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)*</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter today's weight"
                    min="30"
                    max="300"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={(e) => handleFormDataChange('weight', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>BMI</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {bmi ? bmi.toFixed(1) : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sleep">Sleep (hours)*</Label>
                  <Input
                    id="sleep"
                    type="number"
                    placeholder="Hours of sleep"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.sleep || ''}
                    onChange={(e) => handleFormDataChange('sleep', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise (minutes)*</Label>
                  <Input
                    id="exercise"
                    type="number"
                    placeholder="Minutes of exercise"
                    min="0"
                    max="1440"
                    value={formData.exercise || ''}
                    onChange={(e) => handleFormDataChange('exercise', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yoga">Yoga (minutes)</Label>
                  <Input
                    id="yoga"
                    type="number"
                    placeholder="Minutes of yoga"
                    min="0"
                    max="1440"
                    value={formData.yoga || ''}
                    onChange={(e) => handleFormDataChange('yoga', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water">Water (glasses)*</Label>
                  <Input
                    id="water"
                    type="number"
                    placeholder="Number of glasses"
                    min="0"
                    max="50"
                    value={formData.water || ''}
                    onChange={(e) => handleFormDataChange('water', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stress_level">Stress Level</Label>
                  <select
                    id="stress_level"
                    value={formData.stress_level}
                    onChange={(e) => handleFormDataChange('stress_level', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Auto (based on sleep)</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Meals</CardTitle>
              <CardDescription>What did you eat today? Please fill all meal categories.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MealEntry
                meals={meals}
                onMealChange={handleMealChange}
                onCaloriesChange={handleCaloriesChange}
              />
              <CaloriesSummary totalCalories={totalCalories} />
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Please review all your data before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Metrics</h4>
                  <div className="space-y-1 text-sm">
                    <p>Weight: {formData.weight} kg</p>
                    <p>BMI: {bmi?.toFixed(1)}</p>
                    <p>Sleep: {formData.sleep} hours</p>
                    <p>Exercise: {formData.exercise} minutes</p>
                    <p>Yoga: {formData.yoga} minutes</p>
                    <p>Water: {formData.water} glasses</p>
                    <p>Stress Level: {formData.stress_level || 'Auto'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Meals</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Breakfast:</strong> {meals.breakfast || 'Not specified'}</p>
                    <p><strong>Lunch:</strong> {meals.lunch || 'Not specified'}</p>
                    <p><strong>Dinner:</strong> {meals.dinner || 'Not specified'}</p>
                    <p><strong>Snacks:</strong> {meals.snacks || 'Not specified'}</p>
                    <p><strong>Total Calories:</strong> {totalCalories} kcal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl">Loading...</h2>
        </div>
      </div>
    );
  }

  const progressValue = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Daily Health Input</h1>
          <p className="text-muted-foreground">Record today's health data - Step {currentStep} of {STEPS.length}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            {STEPS.map((step) => (
              <div key={step.id} className={`text-center ${currentStep >= step.id ? 'text-primary' : ''}`}>
                <div className="font-medium">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={nextStep}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Saving data...' : 'Save Daily Data'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyInput;