// Rule-based prediction logic for lifestyle disease prediction

export interface PredictionInput {
  bmi: number;
  sleep_hours: number;
  exercise_minutes: number;
  stress_level: string;
  water_glasses: number;
}

export interface PredictionResult {
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

export const generatePredictions = (input: PredictionInput): PredictionResult => {
  // Diabetes Risk Logic
  let diabetesRisk = 10; // Base risk
  let diabetesLevel: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (input.bmi > 25) diabetesRisk += 30;
  if (input.sleep_hours < 5) diabetesRisk += 25;
  if (input.exercise_minutes < 20) diabetesRisk += 20;
  if (input.stress_level === 'high') diabetesRisk += 15;
  
  if (diabetesRisk >= 60) diabetesLevel = 'High';
  else if (diabetesRisk >= 30) diabetesLevel = 'Medium';

  // Heart Disease Risk Logic
  let heartRisk = 15; // Base risk
  let heartLevel: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (input.stress_level === 'high') heartRisk += 25;
  if (input.exercise_minutes < 20) heartRisk += 20;
  if (input.bmi > 30) heartRisk += 20;
  if (input.sleep_hours < 6) heartRisk += 15;
  
  if (heartRisk >= 55) heartLevel = 'High';
  else if (heartRisk >= 35) heartLevel = 'Medium';

  // Obesity Risk Logic
  let obesityRisk = 5; // Base risk
  let obesityLevel: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (input.bmi > 30) {
    obesityRisk = 80;
    obesityLevel = 'High';
  } else if (input.bmi >= 25) {
    obesityRisk = 50;
    obesityLevel = 'Medium';
  } else {
    obesityRisk = 15;
  }
  
  if (input.exercise_minutes < 15) obesityRisk += 10;

  // Sleep Risk Logic
  let sleepRisk = 10; // Base risk
  let sleepLevel: 'Low' | 'Medium' | 'High' = 'Low';
  
  if (input.sleep_hours < 5) {
    sleepRisk = 75;
    sleepLevel = 'High';
  } else if (input.sleep_hours <= 7) {
    sleepRisk = 40;
    sleepLevel = 'Medium';
  } else {
    sleepRisk = 15;
  }
  
  if (input.stress_level === 'high') sleepRisk += 15;

  return {
    diabetes_risk: Math.min(diabetesRisk, 95),
    heart_risk: Math.min(heartRisk, 95),
    obesity_risk: Math.min(obesityRisk, 95),
    sleep_risk: Math.min(sleepRisk, 95),
    risk_levels: {
      diabetes: diabetesLevel,
      heart: heartLevel,
      obesity: obesityLevel,
      sleep: sleepLevel
    }
  };
};

export const generateTips = (predictions: PredictionResult, input: PredictionInput): string[] => {
  const tips: string[] = [];

  // Diabetes tips
  if (predictions.risk_levels.diabetes === 'High') {
    tips.push("Reduce sugar intake and prefer whole grains over refined carbs");
    tips.push("Include more fiber-rich foods like vegetables and legumes");
  }

  // Obesity tips
  if (predictions.risk_levels.obesity === 'High') {
    tips.push("Increase fruits & vegetables, avoid processed and junk foods");
    tips.push("Control portion sizes and eat slowly to feel full");
  }

  // Heart disease tips  
  if (predictions.risk_levels.heart === 'High') {
    tips.push("Avoid fried foods, eat more nuts, fruits, and omega-3 rich fish");
    tips.push("Reduce sodium intake and choose lean proteins");
  }

  // Sleep tips
  if (predictions.risk_levels.sleep === 'High') {
    tips.push("Maintain consistent bedtime, avoid screens 1 hour before sleep");
    tips.push("Create a relaxing bedtime routine and keep bedroom cool");
  }

  // Stress tips
  if (input.stress_level === 'high') {
    tips.push("Practice yoga or deep breathing exercises for 10-15 minutes daily");
    tips.push("Try meditation or mindfulness to manage stress levels");
  }

  // Exercise tips
  if (input.exercise_minutes < 30) {
    tips.push("Aim for at least 30 minutes of moderate exercise daily");
    tips.push("Take stairs instead of elevators, walk more during the day");
  }

  // Water intake tips
  if (input.water_glasses < 8) {
    tips.push("Drink more water throughout the day, aim for 8-10 glasses");
  }

  // Return top 4 most relevant tips
  return tips.slice(0, 4);
};

export const generateDietPlan = (predictions: PredictionResult, input: PredictionInput) => {
  const dietPlan = {
    breakfast: [] as string[],
    lunch: [] as string[],
    dinner: [] as string[],
    snacks: [] as string[]
  };

  // Base healthy options
  dietPlan.breakfast.push("Oatmeal with fresh fruits and nuts");
  dietPlan.lunch.push("Brown rice with dal and vegetables");
  dietPlan.dinner.push("Grilled chicken/fish with steamed vegetables");
  dietPlan.snacks.push("Greek yogurt or a handful of almonds");

  // Modify based on risks
  if (predictions.risk_levels.obesity === 'High') {
    dietPlan.breakfast = ["Vegetable upma or poha with minimal oil", "Green tea and 2 idlis with sambar"];
    dietPlan.lunch = ["Roti with dal, sabzi, and salad", "Quinoa bowl with mixed vegetables"];
    dietPlan.dinner = ["Grilled fish with cucumber raita", "Mixed vegetable soup with 1 roti"];
    dietPlan.snacks = ["Fruits like apple or orange", "Roasted chana or sprouts"];
  }

  if (predictions.risk_levels.heart === 'High' || predictions.risk_levels.heart === 'Medium') {
    dietPlan.breakfast.push("Omega-3 rich foods: walnuts, flax seeds");
    dietPlan.lunch.push("Grilled salmon or sardines with leafy greens");
    dietPlan.snacks.push("Mixed nuts (almonds, walnuts) - limited quantity");
  }

  if (predictions.risk_levels.diabetes === 'High') {
    dietPlan.breakfast = ["Steel-cut oats with cinnamon", "Vegetable daliya without sugar"];
    dietPlan.lunch = ["Whole wheat roti with plenty of vegetables", "Quinoa salad with protein"];
    dietPlan.dinner = ["Grilled protein with non-starchy vegetables", "Vegetable soup with minimal carbs"];
  }

  return {
    breakfast: dietPlan.breakfast.join(' OR '),
    lunch: dietPlan.lunch.join(' OR '),
    dinner: dietPlan.dinner.join(' OR '),
    snacks: dietPlan.snacks.join(' OR ')
  };
};