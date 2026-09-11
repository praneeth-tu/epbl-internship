import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Scale, Moon, Droplets, Activity } from 'lucide-react';

interface DailyData {
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

interface ComparisonChartsProps {
  todayData: DailyData | null;
  yesterdayData: DailyData | null;
}

export const ComparisonCharts = ({ todayData, yesterdayData }: ComparisonChartsProps) => {
  if (!todayData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yesterday vs Today Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for today. Please add your daily input first.</p>
        </CardContent>
      </Card>
    );
  }

  const getComparison = (todayValue: number, yesterdayValue: number | undefined, isReverse = false) => {
    if (yesterdayValue === undefined) {
      return { trend: 'neutral', message: 'No previous data', variant: 'secondary' as const };
    }

    const diff = todayValue - yesterdayValue;
    const improvement = isReverse ? diff < 0 : diff > 0;
    
    if (Math.abs(diff) < 0.1) {
      return { trend: 'neutral', message: 'Same as yesterday', variant: 'secondary' as const };
    }

    if (improvement) {
      return { 
        trend: 'up', 
        message: `+${Math.abs(diff).toFixed(1)} vs yesterday`, 
        variant: 'default' as const 
      };
    } else {
      return { 
        trend: 'down', 
        message: `${diff.toFixed(1)} vs yesterday`, 
        variant: 'destructive' as const 
      };
    }
  };

  const metrics = [
    {
      title: 'Weight',
      icon: Scale,
      todayValue: todayData.weight_kg,
      yesterdayValue: yesterdayData?.weight_kg,
      unit: 'kg',
      isReverse: true, // Lower weight is generally better
    },
    {
      title: 'Sleep Hours',
      icon: Moon,
      todayValue: todayData.sleep_hours,
      yesterdayValue: yesterdayData?.sleep_hours,
      unit: 'hrs',
      isReverse: false,
    },
    {
      title: 'Water Intake',  
      icon: Droplets,
      todayValue: todayData.water_glasses,
      yesterdayValue: yesterdayData?.water_glasses,
      unit: 'glasses',
      isReverse: false,
    },
    {
      title: 'Exercise + Yoga',
      icon: Activity,
      todayValue: todayData.exercise_minutes + todayData.yoga_minutes,
      yesterdayValue: yesterdayData ? (yesterdayData.exercise_minutes + yesterdayData.yoga_minutes) : undefined,
      unit: 'min',
      isReverse: false,
    },
  ];

  const riskMetrics = [
    {
      title: 'Diabetes Risk',
      todayValue: todayData.diabetes_risk || 0,
      yesterdayValue: yesterdayData?.diabetes_risk,
      unit: '%',
    },
    {
      title: 'Heart Risk',
      todayValue: todayData.heart_risk || 0,
      yesterdayValue: yesterdayData?.heart_risk,
      unit: '%',
    },
    {
      title: 'Obesity Risk',
      todayValue: todayData.obesity_risk || 0,
      yesterdayValue: yesterdayData?.obesity_risk,
      unit: '%',
    },
    {
      title: 'Sleep Risk',
      todayValue: todayData.sleep_risk || 0,
      yesterdayValue: yesterdayData?.sleep_risk,
      unit: '%',
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMotivationalMessage = () => {
    if (!yesterdayData) return "Start your health journey today!";
    
    const improvements = [];
    const concerns = [];

    metrics.forEach(metric => {
      const comparison = getComparison(metric.todayValue, metric.yesterdayValue, metric.isReverse);
      if (comparison.trend === 'up') improvements.push(metric.title);
      if (comparison.trend === 'down') concerns.push(metric.title);
    });

    if (improvements.length > concerns.length) {
      return `Great job! You improved in ${improvements.length} areas today. Keep going! 🎉`;
    } else if (concerns.length > improvements.length) {
      return `Room for improvement in ${concerns.length} areas. Tomorrow is a new opportunity! 💪`;
    } else {
      return "Steady progress! Consistency is key to better health. 🌟";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Yesterday vs Today Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
              const comparison = getComparison(metric.todayValue, metric.yesterdayValue, metric.isReverse);
              const Icon = metric.icon;
              
              return (
                <div key={metric.title} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">{metric.title}</h4>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {metric.todayValue}{metric.unit}
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(comparison.trend)}
                      <Badge variant={comparison.variant} className="text-xs">
                        {comparison.message}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-center font-medium text-primary">
              {getMotivationalMessage()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {riskMetrics.map((risk) => {
              const comparison = getComparison(risk.todayValue, risk.yesterdayValue, true); // Lower risk is better
              
              return (
                <div key={risk.title} className="space-y-2">
                  <h4 className="font-semibold text-sm">{risk.title}</h4>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {risk.todayValue}{risk.unit}
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(comparison.trend)}
                      <Badge variant={comparison.variant} className="text-xs">
                        {comparison.message}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};