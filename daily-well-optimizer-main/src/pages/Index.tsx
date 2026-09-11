import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RiskCards } from '@/components/RiskCards';
import { TipsSection } from '@/components/TipsSection';
import { DietPlanSection } from '@/components/DietPlanSection';
import { ComparisonCharts } from '@/components/ComparisonCharts';

interface TodayData {
  weight_kg: number;
  sleep_hours: number;
  water_glasses: number;
  exercise_minutes: number;
  yoga_minutes: number;
  diabetes_risk?: number;
  heart_risk?: number;
  obesity_risk?: number;
  sleep_risk?: number;
}

interface PredictionData {
  diabetes_risk: number;
  heart_risk: number;
  obesity_risk: number;
  sleep_risk: number;
  risk_levels: {
    diabetes: 'Low' | 'Medium' | 'High';
    heart: 'Low' | 'Medium' | 'High';
    obesity: 'Low' | 'Medium' | 'High';
    sleep: 'Low' | 'Medium' | 'High';
  };
  tips: string[];
  diet_plan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [yesterdayData, setYesterdayData] = useState<TodayData | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, loading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Fetch today's data
      const { data: todayInputs } = await supabase
        .from('daily_inputs')
        .select('weight_kg, sleep_hours, water_glasses, exercise_minutes, yoga_minutes')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Fetch yesterday's data
      const { data: yesterdayInputs } = await supabase
        .from('daily_inputs')
        .select('weight_kg, sleep_hours, water_glasses, exercise_minutes, yoga_minutes')
        .eq('user_id', user.id)
        .eq('date', yesterday)
        .maybeSingle();

      // Fetch today's predictions
      const { data: todayPredictions } = await supabase
        .from('predictions')
        .select('diabetes_risk, heart_risk, obesity_risk, sleep_risk, risk_levels, tips, diet_plan')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Fetch yesterday's predictions for comparison
      const { data: yesterdayPredictions } = await supabase
        .from('predictions')
        .select('diabetes_risk, heart_risk, obesity_risk, sleep_risk')
        .eq('user_id', user.id)
        .eq('date', yesterday)
        .maybeSingle();

      // Combine data
      setTodayData(todayInputs ? {
        ...todayInputs,
        diabetes_risk: todayPredictions?.diabetes_risk,
        heart_risk: todayPredictions?.heart_risk,
        obesity_risk: todayPredictions?.obesity_risk,
        sleep_risk: todayPredictions?.sleep_risk
      } : null);

      setYesterdayData(yesterdayInputs ? {
        ...yesterdayInputs,
        diabetes_risk: yesterdayPredictions?.diabetes_risk,
        heart_risk: yesterdayPredictions?.heart_risk,
        obesity_risk: yesterdayPredictions?.obesity_risk,
        sleep_risk: yesterdayPredictions?.sleep_risk
      } : null);

      setPredictions(todayPredictions ? {
        diabetes_risk: todayPredictions.diabetes_risk,
        heart_risk: todayPredictions.heart_risk,
        obesity_risk: todayPredictions.obesity_risk,
        sleep_risk: todayPredictions.sleep_risk,
        risk_levels: todayPredictions.risk_levels as {
          diabetes: 'Low' | 'Medium' | 'High';
          heart: 'Low' | 'Medium' | 'High';
          obesity: 'Low' | 'Medium' | 'High';
          sleep: 'Low' | 'Medium' | 'High';
        },
        tips: todayPredictions.tips as string[],
        diet_plan: todayPredictions.diet_plan as {
          breakfast: string;
          lunch: string;
          dinner: string;
          snacks: string;
        }
      } : null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Health Tracker Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.email}!</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </header>

        <div className="space-y-8">
          {/* Quick Action Card */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Input</CardTitle>
              <CardDescription>Record your daily health data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button className="flex-1" onClick={() => navigate('/daily-input')}>
                  {todayData ? 'Update Today\'s Data' : 'Add Daily Data'}
                </Button>
                {todayData && (
                  <Button variant="outline" onClick={fetchDashboardData}>
                    Refresh Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment Cards */}
          {predictions && (
            <RiskCards riskData={predictions} />
          )}

          {/* Comparison Charts */}
          <ComparisonCharts todayData={todayData} yesterdayData={yesterdayData} />

          {/* Tips and Diet Plan */}
          <div className="grid gap-6 lg:grid-cols-2">
            {predictions?.tips && (
              <TipsSection tips={predictions.tips} />
            )}
            {predictions?.diet_plan && (
              <DietPlanSection dietPlan={predictions.diet_plan} />
            )}
          </div>

          {/* Show message if no data */}
          {!todayData && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">No data for today</h3>
                  <p className="text-muted-foreground">
                    Add your daily health data to see personalized predictions, tips, and diet recommendations.
                  </p>
                  <Button onClick={() => navigate('/daily-input')}>
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
