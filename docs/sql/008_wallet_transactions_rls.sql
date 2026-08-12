ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid()::text = user_id::text);
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can insert own transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid()::text = profile_id::text);
