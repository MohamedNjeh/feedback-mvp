-- Create resolved_alerts table for persisting resolved alert status
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS resolved_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(feedback_id, business_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_resolved_alerts_business_id ON resolved_alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_resolved_alerts_feedback_id ON resolved_alerts(feedback_id);

-- Enable Row Level Security
ALTER TABLE resolved_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see resolved alerts for their own business
CREATE POLICY "Users can view own business resolved alerts" ON resolved_alerts
  FOR SELECT
  USING (business_id = auth.uid());

-- Policy: Users can insert resolved alerts for their own business
CREATE POLICY "Users can insert own business resolved alerts" ON resolved_alerts
  FOR INSERT
  WITH CHECK (business_id = auth.uid());

-- Policy: Users can delete their own resolved alerts (to un-resolve)
CREATE POLICY "Users can delete own business resolved alerts" ON resolved_alerts
  FOR DELETE
  USING (business_id = auth.uid());
