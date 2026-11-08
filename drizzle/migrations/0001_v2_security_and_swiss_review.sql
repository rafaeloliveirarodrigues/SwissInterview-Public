ALTER TABLE public.preps ADD COLUMN IF NOT EXISTS swiss_cv_review jsonb;
ALTER TABLE public.preps ADD COLUMN IF NOT EXISTS cv_page_count integer;
ALTER TABLE public.preps ADD COLUMN IF NOT EXISTS cv_has_photo boolean;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "own sessions" ON public.interview_sessions;
CREATE POLICY "own sessions" ON public.interview_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.preps p WHERE p.id = prep_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "own turns" ON public.interview_turns;
CREATE POLICY "own turns" ON public.interview_turns FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

ALTER TABLE public.preps ADD CONSTRAINT preps_len_check CHECK (char_length(role_title) <= 200 AND char_length(company_name) <= 200 AND char_length(job_description) <= 12000) NOT VALID;
ALTER TABLE public.interview_turns ADD CONSTRAINT turns_answer_len CHECK (answer IS NULL OR char_length(answer) <= 10000) NOT VALID;