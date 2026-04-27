-- Sync user_lifestyle weight to user_weight_goals
UPDATE public.user_weight_goals
SET current_weight_kg = ul.weight_kg
FROM public.user_lifestyle ul
WHERE public.user_weight_goals.user_id = ul.user_id
AND ul.weight_kg IS NOT NULL
AND ul.weight_kg > 0;
