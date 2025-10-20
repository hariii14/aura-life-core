-- Create conversations table to store chat history
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('learn', 'finance', 'health', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table for conversation history
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create study_logs table for tracking learning activities
CREATE TABLE public.study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create goals table for tracking user goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('learn', 'finance', 'health')),
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create insights table for AI-generated insights
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('learn', 'finance', 'health', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create dashboard_stats table for aggregated statistics
CREATE TABLE public.dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE CHECK (domain IN ('learn', 'finance', 'health')),
  stats JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented)
CREATE POLICY "Allow all access to conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to study_logs" ON public.study_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to insights" ON public.insights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to dashboard_stats" ON public.dashboard_stats FOR ALL USING (true) WITH CHECK (true);

-- Create function to update dashboard stats
CREATE OR REPLACE FUNCTION public.update_dashboard_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update learn domain stats
  INSERT INTO public.dashboard_stats (domain, stats, updated_at)
  VALUES (
    'learn',
    jsonb_build_object(
      'total_study_hours', COALESCE((SELECT SUM(duration_minutes) / 60.0 FROM public.study_logs), 0),
      'topics_covered', COALESCE((SELECT COUNT(DISTINCT subject) FROM public.study_logs), 0),
      'active_goals', COALESCE((SELECT COUNT(*) FROM public.goals WHERE domain = 'learn' AND status = 'active'), 0)
    ),
    now()
  )
  ON CONFLICT (domain) DO UPDATE
  SET stats = EXCLUDED.stats, updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-update stats when study logs change
CREATE TRIGGER update_learn_stats_on_study_log
AFTER INSERT OR UPDATE OR DELETE ON public.study_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_stats();

-- Create trigger to auto-update stats when goals change
CREATE TRIGGER update_learn_stats_on_goal
AFTER INSERT OR UPDATE OR DELETE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_stats();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add trigger to goals table
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial dashboard stats
INSERT INTO public.dashboard_stats (domain, stats) VALUES
  ('learn', '{"total_study_hours": 0, "topics_covered": 0, "active_goals": 0}'),
  ('finance', '{"weekly_savings": 0, "expense_trend": 0, "total_saved": 0}'),
  ('health', '{"mood_score": 0, "steps_today": 0, "sleep_hours": 0}')
ON CONFLICT (domain) DO NOTHING;