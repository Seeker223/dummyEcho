import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Screen } from './ScreenPrimitives'
import { useAuth } from '../../auth/context/useAuth'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { formatWalletDate } from '../services/walletService'
import { supabase, supabaseAdmin } from '../../../lib/supabaseClient'

const Wrap = styled.section`
  width: 100%;
  min-height: 100%;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.border)};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? `radial-gradient(circle at 40% 0%, ${theme.colors.glowRed}, transparent 58%),
         linear-gradient(180deg, ${theme.colors.bgStart} 0%, ${theme.colors.bgEnd} 100%)`
      : `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%)`};
  overflow: hidden;
`

const Header = styled.header`
  padding: 14px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const BackBtn = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.9)' : theme.colors.muted)};
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)')};
    }
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 1000;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
`

const Body = styled.div`
  padding: 6px 16px 18px;
  display: grid;
  gap: 14px;
`

const Card = styled.section`
  border-radius: 18px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.10)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.colors.surface)};
  box-shadow: 0 14px 30px rgba(15, 31, 68, 0.12);
  padding: 12px 12px;
`

const WalletRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const WalletLabel = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 850;
  font-size: 0.9rem;
`

const WalletAmount = styled.div`
  margin-top: 4px;
  font-size: 1.5rem;
  font-weight: 1000;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
`

const TopUpBtn = styled.button`
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surfaceAlt)};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 950;
  cursor: pointer;
`

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 1000;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 10px;
`

const TwoCol = styled.div`
  display: grid;
  gap: 10px;
`

const Option = styled.button`
  width: 100%;
  text-align: left;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.colors.border)};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : theme.colors.surface)};
  padding: 12px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  ${({ $active, theme }) =>
    $active
      ? css`
          border-color: ${theme.colors.primary};
          box-shadow: 0 14px 26px rgba(220, 38, 38, 0.16);
          background: ${theme.mode === 'dark' ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)'};
        `
      : null}
`

const OptionLeft = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

const OptionTitle = styled.div`
  font-weight: 1000;
  color: ${({ theme }) => theme.colors.text};
`

const OptionSub = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.9rem;
`

const Price = styled.div`
  font-weight: 1000;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`

const Radio = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0;
  }
`

const ActiveRadio = styled(Radio)`
  border-color: ${({ theme }) => theme.colors.primary};
  &::after {
    opacity: 1;
  }
`

const PayBtn = styled.button`
  width: 100%;
  border: 0;
  border-radius: 16px;
  min-height: 48px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 1000;
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(220, 38, 38, 0.26);

  &:disabled {
    opacity: 0.62;
    cursor: not-allowed;
    box-shadow: none;
  }
`

function ArrowLeft() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PaymentScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, updateProfile } = useAuth()

  const seed = useMemo(() => {
    const raw = location.state || {}
    const minutes = Number(raw.minutes || 5)
    const returnTo = raw.returnTo ? String(raw.returnTo) : 'doctor-live'
    return { minutes: minutes === 10 ? 10 : 5, returnTo }
  }, [location.state])

  const [minutes, setMinutes] = useState(seed.minutes)
  const [method, setMethod] = useState('wallet') // wallet | transfer | card
  const [processing, setProcessing] = useState(false)

  const walletBalanceNumber = Number(currentUser?.walletBalanceNgn || currentUser?.wallet_balance || 0)
  const walletBalance = `NGN ${walletBalanceNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  
  const hasFreeConsultation = !currentUser?.last_free_consultation || (new Date() - new Date(currentUser.last_free_consultation) > 7 * 24 * 60 * 60 * 1000)

  // Pricing
  const price = minutes === 10 ? 950 : minutes === 5 ? 1000 : 0
  
  const isCallReturn = seed.returnTo === 'doctor-live'
  const methodName = method === 'wallet' ? 'EchoWallet' : method === 'transfer' ? 'Paystack bank transfer' : 'Paystack card'
  const actionText = isCallReturn ? 'Continue Call' : 'Save Echo'

  // Block Doctors and Nurses from seeing prices
  if (currentUser?.role === 'doctor' || currentUser?.role === 'nurse') {
    return (
      <Screen>
        <Wrap style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: '#DC2626' }}>Access Denied</h2>
          <p style={{ color: '#64748B' }}>Providers do not purchase Echoes.</p>
          <button 
            onClick={() => navigate('/app/home')}
            style={{ marginTop: '20px', padding: '12px 24px', background: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer' }}
          >
            Go back Home
          </button>
        </Wrap>
      </Screen>
    )
  }

  const onPay = async () => {
    if (processing) return

    // 0. Free Consultation
    if (minutes === 1) {
      setProcessing(true)
      updateProfile({ last_free_consultation: new Date().toISOString() }).catch(console.error)
      try {
        showAssistant({ title: 'Free Consultation', message: 'Your weekly free 1-minute consultation has been applied!', avatar: 'nurse', durationMs: 4000 })
      } catch { }
      setTimeout(() => completePayment('Free Weekly Consultation'), 1500)
      return
    }

    // 1. Subscription Check (Family / Corporate / Premium)
    if (currentUser?.is_subscribed) {
      setProcessing(true)
      try {
        showAssistant({ title: 'Plan Applied', message: 'You have an active subscription. This echo is fully covered!', avatar: 'nurse', durationMs: 4000 })
      } catch { }
      setTimeout(() => completePayment('Subscription'), 1500)
      return
    }

    // 2. Promo Balance Check (Discount Codes)
    const promoBalance = Number(currentUser?.promo_balance || 0)
    if (promoBalance >= price) {
      setProcessing(true)
      updateProfile({ promo_balance: promoBalance - price }).catch(console.error)
      try {
        showAssistant({ title: 'Promo Applied', message: 'Free echo applied directly from your promo balance!', avatar: 'nurse', durationMs: 4000 })
      } catch { }
      setTimeout(() => completePayment('Promo Code'), 1500)
      return
    }

    // 3. Normal Wallet Check
    if (method === 'wallet') {
      if (walletBalanceNumber < price) {
        try {
          showAssistant({
            title: 'Insufficient balance',
            message: `Top up at least NGN ${(price - walletBalanceNumber).toLocaleString()} to continue this session.`,
            avatar: 'nurse',
            durationMs: 7500,
          })
        } catch {
          // ignore
        }
        navigate('/app/wallet-add-funds', {
          state: {
            returnTo: 'payment',
            returnState: { minutes, returnTo: seed.returnTo },
          },
        })
        return
      }

      setProcessing(true)
      const nextWalletBalance = walletBalanceNumber - price
      updateProfile({ wallet_balance: nextWalletBalance }).catch(console.error)
      try {
        await supabaseAdmin.from('profiles').update({ wallet_balance: nextWalletBalance }).eq('id', currentUser.id)
        await supabaseAdmin.from('wallet_transactions').insert({
          user_id: currentUser.id,
          amount: -price,
          type: 'debit',
          status: 'success',
          reference: `consultation_${Date.now()}`,
          metadata: { title: `Echo - EchoWallet (${minutes} mins)` }
        })
      } catch {
        // ignore
      }

      completePayment('EchoWallet')
      return
    }

    setProcessing(true)
    try {
      showAssistant({
        title: 'Opening secure payment',
        message:
          method === 'transfer'
            ? 'Generating a Paystack bank transfer reference.'
            : 'Opening a Paystack card checkout.',
        avatar: 'nurse',
        durationMs: 5000,
      })
    } catch {
      // ignore
    }

    // Initiate Paystack payment for consultation
    try {
      const res = await fetch('/api/payments/paystack-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price * 100,
          email: currentUser?.email || '',
          user_id: currentUser?.id || '',
          source: 'consultation',
          callback_url: `${window.location.origin}/paystack-callback?status=success`,
        })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Payment webhook failed (status ${res.status}). Make sure the ee-paystack-init workflow is active in n8n.`)
      }

      const authUrl = data?.authorization_url || data?.authorizationUrl || data?.data?.authorization_url || data?.data?.authorizationUrl || (Array.isArray(data) ? data[0]?.authorization_url : null)
      
      if (!authUrl) {
        throw new Error('No authorization_url received from the payment service. Check that your Paystack credentials are set in the n8n workflow.')
      }

      // Store consultation metadata before redirecting to Paystack
      try {
        await supabase.from('wallet_transactions').insert({
          user_id: currentUser.id,
          amount: -price,
          type: 'debit',
          status: 'pending',
          reference: `consultation_${method}_${Date.now()}`,
          metadata: { 
            title: `Echo - ${method === 'transfer' ? 'Bank transfer' : 'Card payment'} (${minutes} mins)`,
            consultation_minutes: minutes,
            payment_method: method,
            return_to: seed.returnTo
          }
        })
      } catch {
        // ignore logging error
      }

      // Redirect user to Paystack Checkout
      window.location.href = authUrl

    } catch (err) {
      console.error('Consultation Payment Init Error:', err)
      try {
        showAssistant({
          title: 'Payment Error',
          message: err.message || 'Failed to initiate payment. Please try again.',
          avatar: 'nurse',
          durationMs: 5000,
        })
      } catch {
        // ignore
      }
      setProcessing(false)
    }
  }

  const completePayment = async (label) => {
    try {
      showAssistant({
        title: 'Payment successful',
        message: isCallReturn
          ? `${minutes} minutes added through ${label}. Resuming the secure session now.`
          : `${minutes} minutes of Echo recorded through ${label}.`,
        avatar: 'nurse',
        durationMs: 8000,
      })
    } catch {
      // ignore
    }

    const isQueueCallback = location.state?.returnTo === 'queue-callback'
    if (isQueueCallback && location.state?.queuePayload) {
      try {
        const res = await fetch('/api/call_queue/insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
            'x-echo-user-id': currentUser?.id || '',
            'x-echo-user-email': currentUser?.email || '',
          },
          body: JSON.stringify({
            payload: {
              ...location.state.queuePayload,
              consultation_duration: minutes,
              amount_paid: price,
              status: 'waiting'
            },
            user_id: currentUser?.id || '',
          })
        })

        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Failed to insert')
        const data = result.data

        navigate(`/app/consultation-waiting?queueId=${data.id}`, { 
          replace: true, 
          state: { callType: location.state.callType } 
        })
        return
      } catch (e) {
        console.error('Failed to create call_queue record', e)
        alert('Failed to enter the waiting room. ' + e.message)
      }
    }

    navigate(isCallReturn ? `/app/${seed.returnTo}` : `/app/${location.state?.returnTo || 'voice-ai'}`, {
      replace: true,
      state: isCallReturn ? { paidMinutes: minutes, method } : { paymentComplete: true, minutes, method },
    })
  }

  return (
    <Screen>
      <Wrap>
        <Header>
          <BackBtn type="button" onClick={() => navigate(`/app/${seed.returnTo}`)}>
            <ArrowLeft />
            Back
          </BackBtn>
          <Title>Purchase Echo</Title>
          <span style={{ width: 44 }} aria-hidden="true" />
        </Header>

        <Body>
          <Card>
            <WalletRow>
              <div>
                <WalletLabel>Your EchoWallet Balance</WalletLabel>
                <WalletAmount>{walletBalance}</WalletAmount>
              </div>
              <TopUpBtn type="button" onClick={() => navigate('/app/wallet-add-funds', { state: { returnTo: 'payment', returnState: { minutes, returnTo: seed.returnTo } } })}>
                Top Up
              </TopUpBtn>
            </WalletRow>
          </Card>

          <Card>
            <SectionTitle>Choose Echo Duration</SectionTitle>
            <TwoCol>
              {hasFreeConsultation && (
                <Option $active={minutes === 1} onClick={() => setMinutes(1)} type="button">
                  <OptionLeft>
                    <OptionTitle>Free Consult (1 Minute)</OptionTitle>
                    <OptionSub>Weekly free allowance</OptionSub>
                  </OptionLeft>
                  <div style={{ display: 'grid', justifyItems: 'end', gap: 6 }}>
                    <Price>FREE</Price>
                    {minutes === 1 ? <ActiveRadio aria-hidden="true" /> : <Radio aria-hidden="true" />}
                  </div>
                </Option>
              )}
              <Option $active={minutes === 5} onClick={() => setMinutes(5)} type="button">
                <OptionLeft>
                  <OptionTitle>Quick Consult (5 Minutes)</OptionTitle>
                  <OptionSub>Ideal for fast prescriptions</OptionSub>
                </OptionLeft>
                <div style={{ display: 'grid', justifyItems: 'end', gap: 6 }}>
                  <Price>NGN 1,000</Price>
                  {minutes === 5 ? <ActiveRadio aria-hidden="true" /> : <Radio aria-hidden="true" />}
                </div>
              </Option>
              <Option $active={minutes === 10} onClick={() => setMinutes(10)} type="button">
                <OptionLeft>
                  <OptionTitle>Standard Consult (10 Minutes)</OptionTitle>
                  <OptionSub>In-depth consultation</OptionSub>
                </OptionLeft>
                <div style={{ display: 'grid', justifyItems: 'end', gap: 6 }}>
                  <Price>NGN 950</Price>
                  {minutes === 10 ? <ActiveRadio aria-hidden="true" /> : <Radio aria-hidden="true" />}
                </div>
              </Option>
            </TwoCol>
          </Card>

          <Card>
            <SectionTitle>Payment Method</SectionTitle>
            <TwoCol>
              <Option $active={method === 'wallet'} onClick={() => setMethod('wallet')} type="button">
                <OptionLeft>
                  <OptionTitle>EchoWallet</OptionTitle>
                  <OptionSub>Balance: {walletBalance}</OptionSub>
                </OptionLeft>
                {method === 'wallet' ? <ActiveRadio aria-hidden="true" /> : <Radio aria-hidden="true" />}
              </Option>
              <Option $active={method === 'transfer'} onClick={() => setMethod('transfer')} type="button">
                <OptionLeft>
                  <OptionTitle>Bank Transfer</OptionTitle>
                  <OptionSub>Via Paystack - instant confirmation</OptionSub>
                </OptionLeft>
                {method === 'transfer' ? <ActiveRadio aria-hidden="true" /> : <Radio aria-hidden="true" />}
              </Option>
              <Option $active={method === 'card'} onClick={() => setMethod('card')} type="button">
                <OptionLeft>
                  <OptionTitle>Card Payment</OptionTitle>
                  <OptionSub>Visa / Mastercard / Verve through Paystack</OptionSub>
                </OptionLeft>
                {method === 'card' ? <ActiveRadio aria-hidden="true" /> : <Radio aria-hidden="true" />}
              </Option>
            </TwoCol>
          </Card>

          <Card>
            <SectionTitle>Payment Summary</SectionTitle>
            <OptionSub>
              {minutes} extra minutes - {methodName} - {isCallReturn ? 'resumes the active video/voice session' : 'adds call credits to your account'}.
            </OptionSub>
          </Card>

          <PayBtn type="button" onClick={onPay} disabled={processing}>
            {processing ? 'Processing...' : `Pay NGN ${price.toLocaleString()} & ${actionText} ->`}
          </PayBtn>
        </Body>
      </Wrap>
    </Screen>
  )
}

// Trigger rebuild
