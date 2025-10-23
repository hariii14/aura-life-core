-- Create triggers to update dashboard stats automatically
DROP TRIGGER IF EXISTS update_dashboard_on_study_log ON public.study_logs;
CREATE TRIGGER update_dashboard_on_study_log
  AFTER INSERT OR UPDATE OR DELETE ON public.study_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.update_dashboard_stats();

DROP TRIGGER IF EXISTS update_dashboard_on_goal ON public.goals;
CREATE TRIGGER update_dashboard_on_goal
  AFTER INSERT OR UPDATE OR DELETE ON public.goals
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.update_dashboard_stats();