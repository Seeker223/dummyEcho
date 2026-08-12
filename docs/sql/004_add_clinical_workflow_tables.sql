-- MIGRATION 004: Add Clinical Workflow Tables with RLS
-- This migration adds call_queue, clinical_briefs, and triage_sessions tables
-- Prerequisites: patients table must exist

-- ============================================================
-- CALL_QUEUE TABLE (Consultation queue management)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.call_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  submission_key TEXT NOT NULL,
  patient_name TEXT,
  urgency public.urgency_type,
  urgency_score SMALLINT,
  clinical_summary TEXT,
  red_flags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  queue_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'brief_ready', 'in_consultation', 'complete', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  seen_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT call_queue_pkey PRIMARY KEY (id),
  CONSTRAINT call_queue_submission_key_fk FOREIGN KEY (submission_key) REFERENCES public.patients(submission_key) ON DELETE CASCADE,
  CONSTRAINT call_queue_queue_type_check CHECK (queue_type IN ('doctor', 'nurse')),
  CONSTRAINT call_queue_urgency_score_check CHECK (urgency_score >= 1 AND urgency_score <= 10)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_queue_submission_key ON public.call_queue USING btree (submission_key) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_queue_type_status ON public.call_queue USING btree (queue_type, status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_queue_urgency ON public.call_queue USING btree (urgency_score DESC NULLS LAST) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_queue_created_at ON public.call_queue USING btree (created_at DESC) TABLESPACE pg_default;

-- ============================================================
-- CLINICAL_BRIEFS TABLE (Pre-consultation briefings)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clinical_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  submission_key TEXT NOT NULL,
  patient_name TEXT,
  dob DATE,
  gender TEXT,
  brief_date TIMESTAMP WITH TIME ZONE,
  routing public.routing_type,
  urgency public.urgency_type,
  urgency_score SMALLINT,
  presenting_complaint TEXT,
  history_of_presenting_complaint TEXT,
  active_conditions TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  current_medications TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  known_allergies TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  allergy_flags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  relevant_history JSONB,
  lifestyle_snapshot JSONB,
  emergency_contact JSONB,
  clinical_summary TEXT,
  suggested_investigations TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  red_flags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  clinician_notes TEXT,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'viewed', 'actioned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT clinical_briefs_pkey PRIMARY KEY (id),
  CONSTRAINT clinical_briefs_submission_key_fk FOREIGN KEY (submission_key) REFERENCES public.patients(submission_key) ON DELETE CASCADE,
  CONSTRAINT clinical_briefs_urgency_score_check CHECK (urgency_score >= 1 AND urgency_score <= 10)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_briefs_submission_key ON public.clinical_briefs USING btree (submission_key) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_briefs_routing ON public.clinical_briefs USING btree (routing) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_briefs_urgency ON public.clinical_briefs USING btree (urgency_score DESC NULLS LAST) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_briefs_status ON public.clinical_briefs USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON public.clinical_briefs USING btree (created_at DESC) TABLESPACE pg_default;

-- ============================================================
-- TRIAGE_SESSIONS TABLE (AI-powered triage processing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.triage_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  submission_key TEXT NOT NULL,
  symptoms TEXT,
  priority public.quick_priority_type,
  urgency public.urgency_type,
  urgency_score SMALLINT,
  likely_cause TEXT,
  allergy_flags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  routing public.routing_type,
  clinical_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'routed', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT triage_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT triage_sessions_submission_key_fk FOREIGN KEY (submission_key) REFERENCES public.patients(submission_key) ON DELETE CASCADE,
  CONSTRAINT triage_sessions_urgency_score_check CHECK (urgency_score >= 1 AND urgency_score <= 10)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_triage_submission_key ON public.triage_sessions USING btree (submission_key) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_triage_urgency ON public.triage_sessions USING btree (urgency) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_triage_routing ON public.triage_sessions USING btree (routing) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_triage_status ON public.triage_sessions USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_triage_created_at ON public.triage_sessions USING btree (created_at DESC) TABLESPACE pg_default;

-- ============================================================
-- TRIGGERS for auto-updating updated_at (if needed)
-- ============================================================
-- Note: These tables have created_at but not updated_at. Add if needed:
-- ALTER TABLE call_queue ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- ALTER TABLE clinical_briefs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- ALTER TABLE triage_sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE public.call_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CALL_QUEUE RLS POLICIES
-- ============================================================

-- Patients can view their own call queue entries
CREATE POLICY "Patients can view their own call queue"
ON public.call_queue FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.submission_key = call_queue.submission_key
    AND patients.user_id = auth.uid()::text::uuid OR auth.uid()::text = patients.user_id::text
  )
);

-- Doctors/Nurses can view their queue type entries
CREATE POLICY "Healthcare providers can view their queue type"
ON public.call_queue FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.profile_id = auth.uid()
    AND call_queue.queue_type = 'doctor'
  )
  OR
  EXISTS (
    SELECT 1 FROM nurses
    WHERE nurses.profile_id = auth.uid()
    AND call_queue.queue_type = 'nurse'
  )
);

-- Admins can view all call queue entries
CREATE POLICY "Admins can view all call queue"
ON public.call_queue FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE profile_id = auth.uid()
    AND can_verify_documents = true
  )
);

-- Healthcare providers can update queue status
CREATE POLICY "Healthcare providers can update call queue status"
ON public.call_queue FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.profile_id = auth.uid()
    AND call_queue.queue_type = 'doctor'
  )
  OR
  EXISTS (
    SELECT 1 FROM nurses
    WHERE nurses.profile_id = auth.uid()
    AND call_queue.queue_type = 'nurse'
  )
);

-- ============================================================
-- CLINICAL_BRIEFS RLS POLICIES
-- ============================================================

-- Patients can view their own clinical briefs
CREATE POLICY "Patients can view their own clinical briefs"
ON public.clinical_briefs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.submission_key = clinical_briefs.submission_key
    AND patients.user_id = auth.uid()::text::uuid OR auth.uid()::text = patients.user_id::text
  )
);

-- Healthcare providers can view briefs for their consultations
CREATE POLICY "Healthcare providers can view clinical briefs"
ON public.clinical_briefs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.profile_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM nurses
    WHERE nurses.profile_id = auth.uid()
  )
);

-- Admins can view all briefs
CREATE POLICY "Admins can view all clinical briefs"
ON public.clinical_briefs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE profile_id = auth.uid()
    AND can_verify_documents = true
  )
);

-- Healthcare providers can update brief status
CREATE POLICY "Healthcare providers can update clinical briefs"
ON public.clinical_briefs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.profile_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM nurses
    WHERE nurses.profile_id = auth.uid()
  )
);

-- ============================================================
-- TRIAGE_SESSIONS RLS POLICIES
-- ============================================================

-- Patients can view their own triage sessions
CREATE POLICY "Patients can view their own triage sessions"
ON public.triage_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.submission_key = triage_sessions.submission_key
    AND patients.user_id = auth.uid()::text::uuid OR auth.uid()::text = patients.user_id::text
  )
);

-- Healthcare providers can view triage sessions for routing
CREATE POLICY "Healthcare providers can view triage sessions"
ON public.triage_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.profile_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM nurses
    WHERE nurses.profile_id = auth.uid()
  )
);

-- Admins can view all triage sessions
CREATE POLICY "Admins can view all triage sessions"
ON public.triage_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE profile_id = auth.uid()
    AND can_verify_documents = true
  )
);

-- AI/System can insert and update triage sessions (via service role)
CREATE POLICY "System can manage triage sessions"
ON public.triage_sessions FOR ALL
USING (current_setting('role') = 'postgres');

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Run this query to verify tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('call_queue', 'clinical_briefs', 'triage_sessions')
-- ORDER BY table_name;
