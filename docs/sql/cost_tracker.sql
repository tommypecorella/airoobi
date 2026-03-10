-- ══════════════════════════════════════════════════
-- AIROOBI — Cost Tracker table
-- Eseguire su Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cost_tracker (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('fisso','variabile','una_tantum')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  frequency text NOT NULL CHECK (frequency IN ('mensile','annuale','una_tantum')),
  ref_month date NOT NULL,
  status text NOT NULL DEFAULT 'da_pagare' CHECK (status IN (
    'da_pagare','pagato','free','freemium','a_pagamento','abbandonato','in_ritardo','non_pagato'
  )),
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cost_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON cost_tracker
  FOR ALL USING (auth.jwt() ->> 'email' = 'tommaso.pecorella+ceo@outlook.com');

CREATE INDEX idx_cost_tracker_month ON cost_tracker(ref_month);
CREATE INDEX idx_cost_tracker_status ON cost_tracker(status);
