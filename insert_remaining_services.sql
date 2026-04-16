-- Insert remaining MaxxDental services and their procedure steps
-- Run this script in your Supabase SQL editor after applying the migration

-- 2. Metal Braces
INSERT INTO public.services (
  name, description, icon, duration, duration_note, cost, cost_note,
  hero_description, insurance_title, insurance_description, next_slot
) VALUES (
  'Metal Braces',
  'Traditional stainless steel braces — the most affordable and proven orthodontic treatment.',
  'smile',
  '18–24 months',
  'Adjustment every 4–6 weeks',
  'KES 80,000 – 120,000',
  'Both jaws, all adjustments included',
  'The gold standard in orthodontics. Metal braces are durable, effective, and the most budget-friendly way to achieve a straight smile.',
  'Flexible Payment Plans',
  'Pay a 30% deposit and spread the rest over your treatment period.',
  'Book consultation'
);

-- Procedure steps for Metal Braces
INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 1, 'Consultation', 'Complete orthodontic assessment and treatment planning', '45-60 min'
FROM public.services s WHERE s.name = 'Metal Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 2, 'Braces Fitting', 'Custom braces are bonded to your teeth', '60-90 min'
FROM public.services s WHERE s.name = 'Metal Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 3, 'Adjustment Visits', 'Regular adjustments every 4-6 weeks to progress treatment', '18-24 months'
FROM public.services s WHERE s.name = 'Metal Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 4, 'Braces Removal', 'Braces are carefully removed at the end of treatment', '30-45 min'
FROM public.services s WHERE s.name = 'Metal Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 5, 'Retainer Fitting', 'Custom retainers fitted to maintain your results', '30 min'
FROM public.services s WHERE s.name = 'Metal Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 6, 'Ongoing Care', 'Regular check-ups and retainer adjustments as needed', 'Ongoing'
FROM public.services s WHERE s.name = 'Metal Braces';

-- 3. Ceramic Braces
INSERT INTO public.services (
  name, description, icon, duration, duration_note, cost, cost_note,
  hero_description, insurance_title, insurance_description, next_slot
) VALUES (
  'Ceramic Braces',
  'Tooth-coloured brackets that blend with your smile — effective treatment with a discreet look.',
  'sparkles',
  '18–24 months',
  'Adjustment every 4–6 weeks',
  'KES 120,000 – 180,000',
  'Both jaws, all adjustments included',
  'All the effectiveness of metal braces, but far less noticeable. Ceramic braces use tooth-coloured brackets so you can smile confidently throughout treatment.',
  'Flexible Payment Plans',
  'Pay a 30% deposit and spread the rest over your treatment period.',
  'Book consultation'
);

-- Procedure steps for Ceramic Braces
INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 1, 'Consultation', 'Complete orthodontic assessment and treatment planning', '45-60 min'
FROM public.services s WHERE s.name = 'Ceramic Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 2, 'Braces Fitting', 'Tooth-colored ceramic braces are bonded to your teeth', '60-90 min'
FROM public.services s WHERE s.name = 'Ceramic Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 3, 'Adjustment Visits', 'Regular adjustments every 4-6 weeks to progress treatment', '18-24 months'
FROM public.services s WHERE s.name = 'Ceramic Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 4, 'Braces Removal', 'Braces are carefully removed at the end of treatment', '30-45 min'
FROM public.services s WHERE s.name = 'Ceramic Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 5, 'Retainer Fitting', 'Custom retainers fitted to maintain your results', '30 min'
FROM public.services s WHERE s.name = 'Ceramic Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 6, 'Ongoing Care', 'Regular check-ups and retainer adjustments as needed', 'Ongoing'
FROM public.services s WHERE s.name = 'Ceramic Braces';

-- 4. Self-Ligating Braces
INSERT INTO public.services (
  name, description, icon, duration, duration_note, cost, cost_note,
  hero_description, insurance_title, insurance_description, next_slot
) VALUES (
  'Self-Ligating Braces',
  'Modern braces with built-in clips instead of rubber bands — fewer visits, faster results.',
  'zap',
  '12–20 months',
  'Adjustment every 6–8 weeks',
  'KES 100,000 – 150,000',
  'Both jaws, all adjustments included',
  'Self-ligating braces use a sliding mechanism instead of elastic ties, reducing friction and often shortening treatment time.',
  'Flexible Payment Plans',
  'Pay a 30% deposit and spread the rest over your treatment period.',
  'Book consultation'
);

-- Procedure steps for Self-Ligating Braces
INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 1, 'Consultation', 'Complete orthodontic assessment and treatment planning', '45-60 min'
FROM public.services s WHERE s.name = 'Self-Ligating Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 2, 'Braces Fitting', 'Self-ligating braces are bonded to your teeth', '60-90 min'
FROM public.services s WHERE s.name = 'Self-Ligating Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 3, 'Adjustment Visits', 'Regular adjustments every 6-8 weeks (fewer visits needed)', '12-20 months'
FROM public.services s WHERE s.name = 'Self-Ligating Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 4, 'Braces Removal', 'Braces are carefully removed at the end of treatment', '30-45 min'
FROM public.services s WHERE s.name = 'Self-Ligating Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 5, 'Retainer Fitting', 'Custom retainers fitted to maintain your results', '30 min'
FROM public.services s WHERE s.name = 'Self-Ligating Braces';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 6, 'Ongoing Care', 'Regular check-ups and retainer adjustments as needed', 'Ongoing'
FROM public.services s WHERE s.name = 'Self-Ligating Braces';

-- 5. Clear Aligners
INSERT INTO public.services (
  name, description, icon, duration, duration_note, cost, cost_note,
  hero_description, insurance_title, insurance_description, next_slot
) VALUES (
  'Clear Aligners',
  'Removable, near-invisible trays that straighten your teeth without wires or brackets.',
  'eye-off',
  '12–18 months',
  'New tray set every 2 weeks',
  'KES 150,000 – 350,000',
  'Full treatment, both jaws',
  'The modern alternative to braces. Clear aligners are virtually invisible, removable for eating and cleaning, and custom-made for your teeth.',
  'Flexible Payment Plans',
  'Pay a 30% deposit and spread the rest over your treatment period.',
  'Book consultation'
);

-- Procedure steps for Clear Aligners
INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 1, 'Consultation', 'Complete orthodontic assessment and digital scanning', '45-60 min'
FROM public.services s WHERE s.name = 'Clear Aligners';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 2, 'Treatment Planning', '3D treatment plan created from your scans', '1-2 weeks'
FROM public.services s WHERE s.name = 'Clear Aligners';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 3, 'Aligner Fitting', 'Receive your first set of custom aligners', '30 min'
FROM public.services s WHERE s.name = 'Clear Aligners';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 4, 'Wear & Change', 'Wear each aligner set for 2 weeks, change as directed', '12-18 months'
FROM public.services s WHERE s.name = 'Clear Aligners';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 5, 'Check-up Visits', 'Regular monitoring visits every 6-8 weeks', '12-18 months'
FROM public.services s WHERE s.name = 'Clear Aligners';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 6, 'Final Check & Retainers', 'Treatment completion check and retainer fitting', '30 min'
FROM public.services s WHERE s.name = 'Clear Aligners';

-- 6. Retainers
INSERT INTO public.services (
  name, description, icon, duration, duration_note, cost, cost_note,
  hero_description, insurance_title, insurance_description, next_slot
) VALUES (
  'Retainers',
  'Custom retainers to maintain your results after braces are removed.',
  'shield-check',
  'Ongoing',
  'Worn nightly long-term',
  'KES 8,000 – 20,000',
  'Per retainer, upper or lower',
  'After your braces come off, retainers keep your teeth in their new position. Don''t skip this step — it protects your entire investment.',
  NULL,
  NULL,
  'Book consultation'
);

-- Procedure steps for Retainers
INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 1, 'Book Appointment', 'Schedule your retainer fitting appointment', '5 min'
FROM public.services s WHERE s.name = 'Retainers';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 2, 'Impressions/Scanning', 'Take impressions or digital scans for custom retainers', '15 min'
FROM public.services s WHERE s.name = 'Retainers';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 3, 'Fitting & Adjustment', 'Retainers are fitted and adjusted for comfort', '30 min'
FROM public.services s WHERE s.name = 'Retainers';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 4, 'Wear Instructions', 'Receive detailed instructions for wearing and caring for retainers', '10 min'
FROM public.services s WHERE s.name = 'Retainers';

INSERT INTO public.service_procedures (service_id, step_number, title, description, duration)
SELECT s.id, 5, 'Follow-up Care', 'Regular check-ups to ensure retainers fit properly', 'Ongoing'
FROM public.services s WHERE s.name = 'Retainers';