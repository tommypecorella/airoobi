-- Add treasury_pct to treasury_funds for split tracking
-- treasury_pct = % of amount_eur that goes to Treasury (rest goes to Service)
ALTER TABLE treasury_funds ADD COLUMN IF NOT EXISTS treasury_pct integer DEFAULT 100;
