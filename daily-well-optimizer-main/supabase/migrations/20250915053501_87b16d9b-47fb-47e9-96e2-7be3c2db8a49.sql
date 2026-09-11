-- Add unique constraint for proper upsert functionality
-- This ensures only one daily input record per user per date
ALTER TABLE public.daily_inputs 
ADD CONSTRAINT daily_inputs_user_date_unique UNIQUE (user_id, date);