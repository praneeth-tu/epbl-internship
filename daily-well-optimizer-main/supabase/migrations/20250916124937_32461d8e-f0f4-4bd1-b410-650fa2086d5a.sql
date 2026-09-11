-- Insert sample food data for the meal tracking system
INSERT INTO public.foods (name, calories_per_100g, category, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g) VALUES 
-- Indian Foods
('Rice (Basmati)', 130, 'grains', 2.7, 28, 0.3, 0.4),
('Roti (Whole Wheat)', 297, 'grains', 12, 50, 4, 8),
('Dal (Lentils)', 116, 'pulses', 9, 20, 0.4, 8),
('Chicken Breast', 165, 'protein', 31, 0, 3.6, 0),
('Paneer', 265, 'dairy', 18, 1.2, 20, 0),
('Banana', 89, 'fruits', 1.1, 23, 0.3, 2.6),
('Apple', 52, 'fruits', 0.3, 14, 0.2, 2.4),
('Idli', 58, 'grains', 2, 12, 0.1, 0.6),
('Dosa', 133, 'grains', 4, 28, 0.5, 0.8),
('Sambar', 85, 'vegetables', 4, 15, 1, 3),

-- International Foods  
('Oats', 389, 'grains', 17, 66, 7, 11),
('Quinoa', 368, 'grains', 14, 64, 6, 7),
('Salmon', 208, 'protein', 25, 0, 12, 0),
('Greek Yogurt', 59, 'dairy', 10, 3.6, 0.4, 0),
('Almonds', 579, 'nuts', 21, 22, 50, 12),
('Spinach', 23, 'vegetables', 2.9, 3.6, 0.4, 2.2),
('Broccoli', 34, 'vegetables', 2.8, 7, 0.4, 2.6),
('Sweet Potato', 86, 'vegetables', 1.6, 20, 0.1, 3),
('Eggs', 155, 'protein', 13, 1.1, 11, 0),
('Avocado', 160, 'fruits', 2, 9, 15, 7),

-- Snacks
('Roasted Chana', 364, 'snacks', 17, 61, 6, 17),
('Mixed Nuts', 607, 'nuts', 20, 21, 54, 9),
('Green Tea', 1, 'beverages', 0, 0, 0, 0),
('Buttermilk', 40, 'dairy', 3.1, 4.8, 0.9, 0),
('Cucumber', 15, 'vegetables', 0.7, 4, 0.1, 0.5);

-- Add nutritious options
INSERT INTO public.foods (name, calories_per_100g, category, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g) VALUES 
('Brown Rice', 112, 'grains', 2.6, 23, 0.9, 1.8),
('Millet', 378, 'grains', 11, 73, 4.2, 8.5),
('Fish (Pomfret)', 96, 'protein', 19, 0, 1.2, 0),
('Tofu', 76, 'protein', 8, 1.9, 4.8, 0.4),
('Cabbage', 25, 'vegetables', 1.3, 6, 0.1, 2.5),
('Carrot', 41, 'vegetables', 0.9, 10, 0.2, 2.8),
('Tomato', 18, 'vegetables', 0.9, 3.9, 0.2, 1.2),
('Orange', 47, 'fruits', 0.9, 12, 0.1, 2.4),
('Papaya', 43, 'fruits', 0.5, 11, 0.3, 1.7),
('Moong Dal', 347, 'pulses', 24, 59, 1.2, 16);