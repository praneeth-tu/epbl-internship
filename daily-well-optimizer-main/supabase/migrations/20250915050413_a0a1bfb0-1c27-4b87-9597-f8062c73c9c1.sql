-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION calculate_stress_level(sleep_hours numeric)
RETURNS text 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF sleep_hours < 5 THEN
        RETURN 'high';
    ELSIF sleep_hours >= 5 AND sleep_hours <= 7 THEN
        RETURN 'medium';
    ELSE
        RETURN 'low';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION auto_calculate_stress_level()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If stress_level is not explicitly set or is empty, calculate it based on sleep hours
    IF NEW.stress_level IS NULL OR NEW.stress_level = '' THEN
        NEW.stress_level := calculate_stress_level(NEW.sleep_hours);
    END IF;
    
    RETURN NEW;
END;
$$;