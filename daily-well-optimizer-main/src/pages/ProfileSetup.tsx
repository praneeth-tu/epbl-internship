import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfileSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if profile already exists
    const checkProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        navigate('/');
      }
    };

    checkProfile();
  }, [user, navigate]);

  const calculateBMI = (height: number, weight: number) => {
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      return weight / (heightInMeters * heightInMeters);
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const form = e.currentTarget.form;
    if (form) {
      const formData = new FormData(form);
      const height = parseFloat(formData.get('height') as string);
      const weight = parseFloat(formData.get('weight') as string);
      
      if (height && weight) {
        const calculatedBmi = calculateBMI(height, weight);
        setBmi(calculatedBmi);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const age = parseInt(formData.get('age') as string);
    const gender = formData.get('gender') as string;
    const height = parseFloat(formData.get('height') as string);
    const weight = parseFloat(formData.get('weight') as string);

    if (!age || !gender || !height || !weight) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const calculatedBmi = calculateBMI(height, weight);
    if (!calculatedBmi) {
      setError('Invalid height or weight values');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        age,
        gender,
        height_cm: height,
        weight_kg: weight,
        bmi: calculatedBmi
      });

    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Profile setup complete!",
        description: "Your health profile has been created successfully.",
      });
      navigate('/');
    }
    setIsLoading(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            We need some basic information to personalize your health insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Enter your age"
                min="1"
                max="120"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="Enter your height in cm"
                min="100"
                max="250"
                step="0.1"
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="Enter your weight in kg"
                min="30"
                max="300"
                step="0.1"
                onChange={handleInputChange}
                required
              />
            </div>

            {bmi && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Your BMI:</p>
                <p className="text-lg font-semibold">{bmi.toFixed(1)}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Setting up profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;