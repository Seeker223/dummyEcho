import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { fetchLiveBalance } from '../services/walletService'
import { useAppState } from '../../../app/context/useAppState'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const Wrap = styled.section`
  width: 100%;
  min-height: 100%;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.colors.border)};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? `radial-gradient(circle at 40% 0%, ${theme.colors.glowBlue}, transparent 58%),
         linear-gradient(180deg, ${theme.colors.bgStart} 0%, ${theme.colors.bgEnd} 100%)`
      : `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%)`};
  overflow: hidden;
  animation: ${fadeUp} 220ms ease both;
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

const Label = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 850;
  font-size: 0.9rem;
`

const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
`

const EyeToggle = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)

const AmountRow = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
`

const Prefix = styled.div`
  font-weight: 950;
  color: ${({ theme }) => theme.colors.muted};
`

const AmountInput = styled.input`
  flex: 1 1 auto;
  width: 100%;
  border-radius: 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 12px;
  font-size: 1.1rem;
  font-weight: 900;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.glowBlue};
  }
`

const Chips = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button`
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) =>
    $active ? (theme.mode === 'dark' ? 'rgba(239,68,68,0.12)' : 'rgba(220,38,38,0.08)') : theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 900;
  cursor: pointer;
`

const PayBtn = styled.button`
  width: 100%;
  padding: 18px 24px;
  border-radius: 16px;
  border: 0;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#33d6b7' : theme.colors.primary)};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#04131a' : '#fff')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`

function ArrowLeft() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatNgn(amount) {
  const v = Number(amount || 0)
  return `NGN ${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function WalletAddFundsScreen() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { showToast } = useAppState()

  const [liveBalance, setLiveBalance] = useState(null)
  const [amount, setAmount] = useState(2000)
  const [processing, setProcessing] = useState(false)
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    if (currentUser?.id) {
      fetchLiveBalance(currentUser.id).then((bal) => {
        if (bal !== null && bal !== undefined) {
          setLiveBalance(bal)
        }
      })
    }
  }, [currentUser?.id])

  const rawBalance = liveBalance !== null ? liveBalance : (currentUser?.wallet_balance ?? currentUser?.walletBalanceNgn ?? 0)
  const balance = Number(rawBalance) || 0

  const balanceText = useMemo(() => {
    if (!showBalance) return '******'
    const formatted = balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return `NGN ${formatted}`
  }, [balance, showBalance])

  const presets = [1000, 2000, 5000, 10000, 25000]

  const validAmount = Number(amount) >= 500

  const onPay = async () => {
    if (!validAmount || processing) return
    setProcessing(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const res = await fetch('/api/payments/paystack-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount) * 100,
          email: currentUser?.email || '',
          user_id: currentUser?.id || '',
          source: 'wallet-add-funds',
          callback_url: `${window.location.origin}/paystack-callback?status=success`,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await res.json().catch(() => ({}))
      
      // Check for 503 Service Unavailable - temporary issue
      if (res.status === 503) {
        console.warn('Payment service temporarily unavailable:', data)
        showToast('Payment service is temporarily unavailable. Please try again in a moment.', 'warning')
        setProcessing(false)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || `Payment service failed (status ${res.status}).`)
      }

      const authUrl = data?.authorization_url || data?.authorizationUrl || data?.data?.authorization_url || data?.data?.authorizationUrl
      if (!authUrl) {
        throw new Error('No Paystack checkout link was returned. Please contact support.')
      }

      window.location.href = authUrl

    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('Payment request timeout')
        showToast('Payment service took too long to respond. Please try again.', 'error')
      } else {
        console.error('Payment Init Error:', err)
        showToast(err.message || 'Something went wrong initiating the payment. Please try again.', 'error')
      }
      setProcessing(false)
    }
  }

  return (
    <Screen>
      <Wrap>
        <Header>
          <BackBtn type="button" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Back
          </BackBtn>
          <Title>Add funds</Title>
          <span style={{ width: 44 }} aria-hidden="true" />
        </Header>

        <Body>
          <Card>
            <Label>Current balance</Label>
            <BalanceRow>
              <div style={{ fontSize: '1.35rem', fontWeight: 1000 }}>
                {balanceText}
              </div>
              <EyeToggle
                type="button"
                aria-label={showBalance ? 'Hide wallet balance' : 'Show wallet balance'}
                onClick={() => setShowBalance((prev) => !prev)}
              >
                {showBalance ? <EyeOffIcon /> : <EyeIcon />}
              </EyeToggle>
            </BalanceRow>
          </Card>

          <Card>
            <Label>Top-up amount</Label>
            <AmountRow>
              <Prefix>NGN</Prefix>
              <AmountInput
                inputMode="numeric"
                value={String(amount)}
                onChange={(e) => setAmount(Number(String(e.target.value).replace(/[^\d]/g, '')) || 0)}
                aria-label="Amount"
              />
            </AmountRow>
            <Chips>
              {presets.map((p) => (
                <Chip key={p} $active={Number(amount) === p} type="button" onClick={() => setAmount(p)}>
                  {p.toLocaleString()}
                </Chip>
              ))}
            </Chips>
            {!validAmount ? <div style={{ marginTop: 8, color: '#b42318', fontWeight: 800 }}>Minimum top-up is NGN 500.</div> : null}
          </Card>



          <PayBtn disabled={!validAmount || processing} type="button" onClick={onPay}>
            {processing ? 'Processing...' : `Add ${formatNgn(amount)} to wallet`}
          </PayBtn>
        </Body>
      </Wrap>
    </Screen>
  )
}

