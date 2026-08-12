import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Screen } from './ScreenPrimitives'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { addWalletTransaction, formatWalletDate } from '../services/walletService'

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

const Helper = styled.div`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.45;
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

const FieldGroup = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Input = styled.input`
  width: 100%;
  border-radius: 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px;
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const Select = styled.select`
  width: 100%;
  border-radius: 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px;
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const WithdrawBtn = styled.button`
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
    opacity: 0.55;
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

function formatNgn(amount) {
  const v = Number(amount || 0)
  return `NGN ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function WalletWithdrawScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, updateProfile } = useAuth()

  const returnTo = useMemo(() => String(location.state?.returnTo || 'wallet'), [location.state])

  const existingBalance = Number(currentUser?.wallet_balance ?? currentUser?.walletBalanceNgn ?? 0)
  const [amount, setAmount] = useState(2000)
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [processing, setProcessing] = useState(false)

  const presets = [1000, 2000, 5000, 10000, 25000]
  const numericAmount = Number(amount)
  const validAmount = numericAmount >= 500 && numericAmount <= existingBalance && bankCode && accountNumber.length >= 10 && accountName.trim().length > 0

  const onWithdraw = async () => {
    if (!validAmount || processing) return
    setProcessing(true)

    try {
      showAssistant({
        title: 'Withdrawing funds',
        message: 'Initiating withdrawal to your bank account...',
        avatar: 'doctor',
        durationMs: 4500,
      })
      
      const payload = {
        account_number: accountNumber,
        bank_code: bankCode,
        account_name: accountName,
        amount: numericAmount,
        user_id: currentUser.id,
        email: currentUser.email
      }
      
      const res = await fetch(process.env.NEXT_PUBLIC_N8N_WITHDRAW_WEBHOOK || 'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        let errorMsg = 'Failed to initiate withdrawal'
        try {
          const errorData = await res.json()
          errorMsg = errorData.error || (errorData.errors && errorData.errors[0]) || errorMsg
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMsg)
      }
      
      showAssistant({
        title: 'Withdrawal initiated',
        message: `Your withdrawal of ${formatNgn(amount)} is pending confirmation.`,
        avatar: 'doctor',
        durationMs: 6500,
      })
      
      navigate(`/app/${returnTo}`, { replace: true })
    } catch (err) {
      showAssistant({
        title: 'Withdrawal Error',
        message: err.message || 'Could not process withdrawal. Please try again.',
        avatar: 'doctor',
        durationMs: 6500,
      })
    } finally {
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
          <Title>Withdraw funds</Title>
          <div style={{ width: 72 }} />
        </Header>

        <Body>
          <Card>
            <Label>Withdraw amount</Label>
            <AmountRow>
              <Prefix>NGN</Prefix>
              <AmountInput
                inputMode="numeric"
                min="0"
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </AmountRow>
            <Helper>
              Available: <strong>{formatNgn(existingBalance)}</strong>. Minimum withdrawal: NGN 500.00.
            </Helper>
            <Chips>
              {presets.map((v) => (
                <Chip key={v} $active={Number(amount) === v} type="button" onClick={() => setAmount(v)}>
                  {`NGN ${v.toLocaleString()}`}
                </Chip>
              ))}
            </Chips>

            <FieldGroup>
              <Label>Bank</Label>
              <Select value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
                <option value="" disabled>Select a bank</option>
                <option value="044">Access Bank</option>
                <option value="050">EcoBank</option>
                <option value="070">Fidelity Bank</option>
                <option value="011">First Bank</option>
                <option value="058">Guaranty Trust Bank (GTB)</option>
                <option value="50211">Kuda Bank</option>
                <option value="50515">Moniepoint MFB</option>
                <option value="999992">OPay</option>
                <option value="999991">PalmPay</option>
                <option value="076">Polaris Bank</option>
                <option value="221">Stanbic IBTC</option>
                <option value="232">Sterling Bank</option>
                <option value="032">Union Bank</option>
                <option value="033">United Bank for Africa (UBA)</option>
                <option value="215">Unity Bank</option>
                <option value="035">Wema Bank</option>
                <option value="057">Zenith Bank</option>
              </Select>

              <Label>Account Number</Label>
              <Input
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />

              <Label>Account Name</Label>
              <Input
                placeholder="Name on account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </FieldGroup>
          </Card>

          <WithdrawBtn disabled={!validAmount || processing} type="button" onClick={onWithdraw}>
            {processing ? 'Processing...' : 'Withdraw'}
          </WithdrawBtn>
        </Body>
      </Wrap>
    </Screen>
  )
}
