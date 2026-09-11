-- Add yoga and stress_level columns to daily_inputs table
ALTER TABLE public.daily_inputs 
ADD COLUMN yoga_minutes integer DEFAULT 0,
ADD COLUMN stress_level text DEFAULT 'medium' CHECK (stress_level IN ('high', 'medium', 'low'));

-- Insert common Indian food items with their nutritional values
INSERT INTO public.foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, category) VALUES
-- Breakfast items
('Idli', 58, 2.5, 12, 0.3, 0.6, 'breakfast'),
('Dosa', 168, 4.5, 23, 6.5, 1.2, 'breakfast'),
('Upma', 200, 6, 40, 3, 2.5, 'breakfast'),
('Poha', 130, 3, 23, 2.5, 1.8, 'breakfast'),
('Roti', 297, 11, 54, 4, 4.8, 'grains'),
('Chapati', 297, 11, 54, 4, 4.8, 'grains'),

-- Proteins
('Dal (Lentils)', 116, 9, 20, 0.4, 8, 'proteins'),
('Chicken Curry', 180, 25, 3, 8, 0.5, 'proteins'),
('Fish Curry', 150, 20, 2, 7, 0.3, 'proteins'),
('Mutton Curry', 250, 22, 2, 18, 0.2, 'proteins'),

-- Vegetables
('Mixed Vegetable Curry', 80, 3, 12, 3, 4, 'vegetables'),
('Palak (Spinach)', 23, 2.9, 3.6, 0.4, 2.2, 'vegetables'),
('Bhindi (Okra)', 33, 1.9, 7.5, 0.2, 3.2, 'vegetables'),
('Aloo (Potato)', 77, 2, 17, 0.1, 2.2, 'vegetables'),

-- Fruits
('Mango', 60, 0.8, 15, 0.4, 1.6, 'fruits'),
('Pomegranate', 83, 1.7, 19, 1.2, 4, 'fruits'),
('Banana', 89, 1.1, 23, 0.3, 2.6, 'fruits'),

-- Beverages
('Tea (with milk and sugar)', 30, 1.5, 5, 1, 0, 'beverages'),
('Coffee (with milk)', 25, 1.2, 4, 1.2, 0, 'beverages'),

-- Snacks
('Biscuits (digestive)', 480, 7, 66, 20, 3, 'snacks'),
('Samosa', 308, 6, 25, 20, 3, 'snacks'),
('Pakora', 250, 8, 18, 16, 2.5, 'snacks'),

-- Rice items
('Basmati Rice (cooked)', 130, 2.7, 28, 0.3, 0.4, 'grains'),
('Biryani', 200, 8, 35, 4, 1.5, 'grains'),

-- Additional items
('Curd (Yogurt)', 60, 3.5, 4.7, 4.3, 0, 'dairy'),
('Ghee', 900, 0, 0, 100, 0, 'fats'),
('Coconut Oil', 862, 0, 0, 100, 0, 'fats');

-- Create function to auto-calculate stress level based on sleep hours
CREATE OR REPLACE FUNCTION calculate_stress_level(sleep_hours numeric)
RETURNS text AS $$
BEGIN
    IF sleep_hours < 5 THEN
        RETURN 'high';
    ELSIF sleep_hours >= 5 AND sleep_hours <= 7 THEN
        RETURN 'medium';
    ELSE
        RETURN 'low';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate stress level if not provided
CREATE OR REPLACE FUNCTION auto_calculate_stress_level()
RETURNS trigger AS $$
BEGIN
    -- If stress_level is not explicitly set or is empty, calculate it based on sleep hours
    IF NEW.stress_level IS NULL OR NEW.stress_level = '' THEN
        NEW.stress_level := calculate_stress_level(NEW.sleep_hours);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_stress_level
    BEFORE INSERT OR UPDATE ON public.daily_inputs
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_stress_level();