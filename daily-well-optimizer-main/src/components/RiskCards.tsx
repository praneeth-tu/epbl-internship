import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Activity, Scale, Moon } from 'lucide-react';

interface RiskData {
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
}

interface RiskCardsProps {
  riskData: RiskData;
}

const getRiskColor = (level: string) => {
  switch (level) {
    case 'Low': return 'bg-green-500';
    case 'Medium': return 'bg-yellow-500';
    case 'High': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getRiskBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (level) {
    case 'Low': return 'secondary';
    case 'Medium': return 'outline';
    case 'High': return 'destructive';
    default: return 'default';
  }
};

export const RiskCards = ({ riskData }: RiskCardsProps) => {
  const risks = [
    {
      title: 'Diabetes Risk',
      value: riskData.diabetes_risk,
      level: riskData.risk_levels.diabetes,
      icon: Activity,
      description: 'Based on BMI, sleep, and lifestyle factors'
    },
    {
      title: 'Heart Disease Risk',
      value: riskData.heart_risk, 
      level: riskData.risk_levels.heart,
      icon: Heart,
      description: 'Based on stress, exercise, and BMI'
    },
    {
      title: 'Obesity Risk',
      value: riskData.obesity_risk,
      level: riskData.risk_levels.obesity,
      icon: Scale,
      description: 'Based on current BMI and activity level'
    },
    {
      title: 'Sleep Disorder Risk',
      value: riskData.sleep_risk,
      level: riskData.risk_levels.sleep,
      icon: Moon,
      description: 'Based on sleep hours and stress levels'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Today's Risk Assessment</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {risks.map((risk) => {
          const Icon = risk.icon;
          return (
            <Card key={risk.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{risk.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{risk.value}%</div>
                    <Badge variant={getRiskBadgeVariant(risk.level)}>
                      {risk.level}
                    </Badge>
                  </div>
                  <Progress 
                    value={risk.value} 
                    className="w-full"
                    style={{
                      '--tw-bg-opacity': '0.2'
                    } as React.CSSProperties}
                  />
                  <p className="text-xs text-muted-foreground">
                    {risk.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};