REVOKE EXECUTE ON FUNCTION public.refund_interview_credit() FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.refund_interview_credit() TO service_role;