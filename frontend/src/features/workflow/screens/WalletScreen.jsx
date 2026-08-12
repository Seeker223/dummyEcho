import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Card, Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { fetchWalletTransactions, fetchLiveBalance } from '../services/walletService'

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const CircleButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  background: ${({ $notify, theme }) =>
    $notify ? '#e8f5ec' : theme.mode === 'dark' ? '#172336' : '#e9ecef'};
  color: ${({ $notify, theme }) => ($notify ? '#16a34a' : theme.colors.text)};
  cursor: pointer;
  position: relative;
`

const NotificationDot = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
`

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.15rem, 4vw, 1.45rem);
`

const Spacer = styled.span`
  width: 36px;
`

const BalanceCard = styled.section`
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 14px;
  color: #fff;
  background: linear-gradient(160deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDeep} 100%);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    right: -50px;
    top: -30px;
    width: 190px;
    height: 190px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
  }
`

const BalanceLabel = styled.p`
  margin: 0 0 10px;
  color: #ffd6db;
`

const reveal = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); filter: blur(3px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
`

const hide = keyframes`
  from { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  to { opacity: 0.6; transform: translateY(-3px) scale(0.99); filter: blur(2px); }
`

const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  user-select: none;
`

const BalanceAmount = styled.p`
  margin: 0;
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  ${({ $visible }) =>
    $visible
      ? css`
          animation: ${reveal} 260ms ease-out;
        `
      : css`
          animation: ${hide} 220ms ease-in;
        `}
`

const EyeToggle = styled.button`
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 1.05rem;
  cursor: pointer;
  pointer-events: none;
`

const ActionCard = styled(Card)`
  margin-bottom: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const ActionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const GreenIcon = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #e8f5ec;
  color: #16a34a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const ActionTitle = styled.p`
  margin: 0;
  font-weight: 700;
`

const ActionSub = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`

const FundCard = styled(Card)`
  padding: 16px 14px;
  display: grid;
  justify-items: center;
  gap: 7px;
  min-height: 104px;
  border-color: ${({ $tone, theme }) => ($tone === 'withdraw' ? 'rgba(220,38,38,0.22)' : theme.colors.border)};
  background: ${({ $tone, theme }) =>
    $tone === 'withdraw'
      ? theme.mode === 'dark'
        ? 'rgba(220,38,38,0.10)'
        : 'rgba(220,38,38,0.04)'
      : theme.mode === 'dark'
        ? 'rgba(255,255,255,0.04)'
        : theme.colors.surface};
`

const FundGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ $columns }) => ($columns === 2 ? 'repeat(2, minmax(0, 1fr))' : '1fr')};
  gap: 10px;
  margin-bottom: 14px;
`

const FundIcon = styled.span`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 1000;
  background: ${({ $tone, theme }) =>
    $tone === 'withdraw'
      ? theme.mode === 'dark'
        ? 'rgba(248,113,113,0.18)'
        : '#fde8ea'
      : '#e8f5ec'};
  color: ${({ $tone, theme }) => ($tone === 'withdraw' ? theme.colors.primary : '#16a34a')};
`

const FundText = styled.p`
  margin: 0;
  font-weight: 700;
  text-align: center;
`

const FundSub = styled.p`
  margin: -2px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.78rem;
  font-weight: 750;
  text-align: center;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 2px 10px;
`

const SectionTitle = styled.h3`
  margin: 0;
  font-size: clamp(1rem, 3.5vw, 1.2rem);
`

const SeeAll = styled.button`
  border: 0;
  background: transparent;
  color: #16a34a;
  font-weight: 700;
  cursor: pointer;
`

const TransactionCard = styled(Card)`
  margin-bottom: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const IconCircle = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: ${({ $type }) => ($type === 'credit' ? '#e8f5ec' : '#fde8ea')};
  color: ${({ $type, theme }) => ($type === 'credit' ? '#16a34a' : theme.colors.primary)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const TransactionTitle = styled.p`
  margin: 0;
  font-weight: 700;
`

const TransactionMeta = styled.p`
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
`

const RightSection = styled.div`
  text-align: right;
`

const AmountText = styled.p`
  margin: 0;
  font-weight: 700;
  color: ${({ $type, theme }) => ($type === 'credit' ? '#16a34a' : theme.colors.text)};
`

const StatusText = styled.p`
  margin: 4px 0 0;
  font-size: 0.82rem;
  color: ${({ $status }) => ($status === 'Successful' ? '#16a34a' : '#f59e0b')};
`

export default function WalletScreen() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [showBalance, setShowBalance] = useState(true)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(0)

  const isClinician = ['doctor', 'nurse'].includes(String(currentUser?.role || '').toLowerCase())
  
  const balanceText = useMemo(
    () =>
      showBalance
        ? `NGN ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '******',
    [balance, showBalance],
  )

  useEffect(() => {
    let active = true

    async function fetchWalletData() {
      if (!currentUser?.id) {
        if (!active) return
        setLoadingBalance(false)
        setLoadingTransactions(false)
        return
      }

      setLoadingBalance(true)
      setLoadingTransactions(true)

      try {
        const liveBalance = await fetchLiveBalance(currentUser.id)
        if (active && liveBalance !== null && liveBalance !== undefined) {
          setBalance(Number(liveBalance) || 0)
        }
      } finally {
        if (active) setLoadingBalance(false)
      }

      try {
        const liveTransactions = await fetchWalletTransactions(currentUser.id)
        if (active) {
          setTransactions(Array.isArray(liveTransactions) ? liveTransactions : [])
        }
      } finally {
        if (active) setLoadingTransactions(false)
      }
    }

    fetchWalletData()

    return () => {
      active = false
    }
  }, [currentUser?.id])

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <CircleButton onClick={() => navigate('/app/home')} type="button">
          {'<'} 
        </CircleButton> 
        <HeaderTitle>Wallet & Payments</HeaderTitle>
        <CircleButton $notify type="button">
          {'N'}
          <NotificationDot />
        </CircleButton>
      </Header>

      <BalanceCard>
        <BalanceLabel>EchoWallet balance</BalanceLabel>
        <BalanceRow onClick={() => setShowBalance((prev) => !prev)}>
          <BalanceAmount $visible={showBalance}>
            {loadingBalance ? 'Loading...' : balanceText}
          </BalanceAmount>
          <EyeToggle
            aria-label={showBalance ? 'Hide wallet balance' : 'Show wallet balance'}
            type="button"
          >
            {showBalance ? <EyeOffIcon /> : <EyeIcon />}
          </EyeToggle>
        </BalanceRow>
      </BalanceCard>



      <FundGrid $columns={isClinician ? 2 : 1}>
        <FundCard as="button" type="button" onClick={() => navigate('/app/wallet-add-funds', { state: { returnTo: 'wallet' } })}>
          <FundIcon aria-hidden="true">+</FundIcon>
          <FundText>Add funds</FundText>
          <FundSub>Top up EchoWallet</FundSub>
        </FundCard>

        {isClinician ? (
          <FundCard
            $tone="withdraw"
            as="button"
            type="button"
            onClick={() => navigate('/app/wallet-withdraw', { state: { returnTo: 'wallet' } })}
          >
            <FundIcon $tone="withdraw" aria-hidden="true">
              -
            </FundIcon>
            <FundText>Withdraw funds</FundText>
            <FundSub>Bank payout</FundSub>
          </FundCard>
        ) : null}
      </FundGrid>

      <SectionHeader>
        <SectionTitle>Recent Transactions</SectionTitle>
        <SeeAll type="button" onClick={() => setShowAllTransactions(prev => !prev)}>
          {showAllTransactions ? 'Show less' : 'See all'}
        </SeeAll>
      </SectionHeader>

      {loadingTransactions ? (
        <p style={{ color: '#8b8e98', textAlign: 'center', padding: '20px 0' }}>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p style={{ color: '#8b8e98', textAlign: 'center', padding: '20px 0' }}>No transactions found.</p>
      ) : (
        (showAllTransactions ? transactions : transactions.slice(0, 3)).map((item) => (
          <TransactionCard key={item.id}>
            <LeftSection>
              <IconCircle $type={item.type}>{item.type === 'credit' ? '+' : '-'}</IconCircle>
              <div>
                <TransactionTitle>{item.title}</TransactionTitle>
                <TransactionMeta>{item.date}</TransactionMeta>
                {item.doctor ? <TransactionMeta>{item.doctor}</TransactionMeta> : null}
              </div>
            </LeftSection>
            <RightSection>
              <AmountText $type={item.type}>{item.amount}</AmountText>
              <StatusText $status={item.status}>{item.status}</StatusText>
            </RightSection>
          </TransactionCard>
        ))
      )}
    </Screen>
  )
}
