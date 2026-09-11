-- Create foods table for calorie database
CREATE TABLE public.foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories_per_100g NUMERIC(7,2) NOT NULL,
  protein_per_100g NUMERIC(5,2) DEFAULT 0,
  carbs_per_100g NUMERIC(5,2) DEFAULT 0,
  fat_per_100g NUMERIC(5,2) DEFAULT 0,
  fiber_per_100g NUMERIC(5,2) DEFAULT 0,
  category TEXT DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster food searches
CREATE INDEX idx_foods_name ON public.foods USING GIN(to_tsvector('english', name));

-- Enable RLS (foods will be publicly readable)
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Create policy for foods (everyone can read)
CREATE POLICY "Foods are publicly readable" 
ON public.foods 
FOR SELECT 
USING (true);

-- Insert some sample foods data
INSERT INTO public.foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category) VALUES
('Apple', 52, 0.3, 14, 0.2, 'fruit'),
('Banana', 89, 1.1, 23, 0.3, 'fruit'),
('Orange', 47, 0.9, 12, 0.1, 'fruit'),
('White Rice (cooked)', 130, 2.7, 28, 0.3, 'grain'),
('Brown Rice (cooked)', 111, 2.6, 23, 0.9, 'grain'),
('Chicken Breast (cooked)', 165, 31, 0, 3.6, 'protein'),
('Salmon (cooked)', 206, 22, 0, 12, 'protein'),
('Eggs (whole)', 155, 13, 1.1, 11, 'protein'),
('Broccoli', 34, 2.8, 7, 0.4, 'vegetable'),
('Spinach', 23, 2.9, 3.6, 0.4, 'vegetable'),
('Oats (dry)', 389, 16.9, 66, 6.9, 'grain'),
('Almonds', 579, 21, 22, 50, 'nut'),
('Milk (whole)', 61, 3.2, 4.8, 3.3, 'dairy'),
('Greek Yogurt', 59, 10, 3.6, 0.4, 'dairy'),
('Sweet Potato', 86, 1.6, 20, 0.1, 'vegetable'),
('Avocado', 160, 2, 9, 15, 'fruit'),
('Bread (whole wheat)', 247, 13, 41, 4.2, 'grain'),
('Tuna (canned in water)', 116, 25, 0, 1, 'protein'),
('Lentils (cooked)', 116, 9, 20, 0.4, 'legume'),
('Quinoa (cooked)', 120, 4.4, 22, 1.9, 'grain');