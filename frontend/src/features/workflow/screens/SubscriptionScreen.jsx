import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Screen, Card, Button } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { showAssistant } from '../components/AssistantCharacterOverlay'
import { useAuth } from '../../auth/context/useAuth'
import { fetchLiveBalance } from '../services/walletService'

const Header = styled.header`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`

const BackBtn = styled.button`
  justify-self: start;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 1000;
`

const Title = styled.h2`
  justify-self: center;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 1000;
  letter-spacing: -0.02em;
`

const Wrap = styled.div`
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(9,17,31,1) 0%, rgba(15,23,42,1) 100%)'
      : theme.colors.surface};
  box-shadow: 0 18px 40px rgba(15, 31, 68, 0.14);
  overflow: hidden;
`

const Section = styled.section`
  padding: 16px;

  @media (min-width: 520px) {
    padding: 18px;
  }
`

const SuggestionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 950;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(241,245,249,0.8)' : theme.colors.muted)};
  margin-bottom: 10px;
`

const Bulb = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 0 5px ${({ theme }) => theme.colors.glowRed};
`

const SuggestionTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 1.08rem;
  font-weight: 1000;
  color: ${({ theme }) => theme.colors.text};
`

const SuggestionBody = styled.p`
  margin: 0 0 14px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 650;
  line-height: 1.6;
`

const PlanGrid = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  
  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
`

const Plan = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  text-align: left;
  display: grid;
  gap: 6px;
  box-shadow: 0 12px 22px rgba(15, 31, 68, 0.08);
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background 150ms ease;

  ${({ $active, theme }) =>
    $active
      ? `
    border-color: ${theme.colors.primary};
    background: ${theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.06)'};
  `
      : ''}
`

const PlanName = styled.div`
  font-weight: 1000;
`

const PlanPrice = styled.div`
  font-weight: 1000;
  color: ${({ theme }) => theme.colors.primary};
`

const PlanMeta = styled.div`
  font-size: 0.86rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.muted};
`

const BestTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.success};
`

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.success};
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.16);
`

const SubTitle = styled.h3`
  margin: 18px 0 10px;
  font-size: 1.02rem;
  font-weight: 1000;
`

const Footer = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)')};
`

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
  margin-top: 16px;
`

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  &::before {
    content: '✅';
    font-size: 1.1rem;
  }
`

const PromoBox = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 14px;
  border-radius: 16px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
  border: 1px dashed ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
`

const PromoInput = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const PromoBtn = styled.button`
  background: ${({ theme }) => theme.mode === 'dark' ? theme.colors.glowRed : theme.colors.primary};
  color: #fff;
  border: none;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
`

// PATIENT PLANS (Revenue Stream 6)
const patientPlans = [
  { id: 'bronze', name: 'Bronze', price: '3,500', numPrice: 3500, meta: '4 consults', group: 'individual' },
  { id: 'silver', name: 'Silver', price: '6,500', numPrice: 6500, meta: 'Best value', group: 'individual' },
  { id: 'gold', name: 'Gold', price: '12,000', numPrice: 12000, meta: 'Unlimited', group: 'individual' },
  { id: 'fam_bronze', name: 'Family Bronze', price: '18,000', numPrice: 18000, meta: 'Up to 6 people (N3,000/person)', group: 'family' },
  { id: 'fam_silver', name: 'Family Silver', price: '28,000', numPrice: 28000, meta: 'Up to 6 people (N4,667/person)', group: 'family' },
  { id: 'fam_gold', name: 'Family Gold', price: '55,000', numPrice: 55000, meta: 'Up to 6 people', group: 'family' },
  { id: 'corp_20', name: 'Corporate (20-50)', price: '2,500/head', numPrice: 50000, meta: 'Min N50k total. Dedicated Manager', group: 'corporate' },
]

// PARTNER PLANS (Revenue Stream 4)
const partnerPlans = [
  { id: 'list_silver', name: 'Silver Listing', price: '5,000', numPrice: 5000, meta: 'Standard directory placement', group: 'listing' },
  { id: 'list_gold', name: 'Gold Listing', price: '10,000', numPrice: 10000, meta: 'Top 1-10 positions + highlighted', group: 'listing' },
  { id: 'ad_silver', name: 'Silver Ad', price: '10,000', numPrice: 10000, meta: 'General feed banner placement', group: 'ad' },
  { id: 'ad_gold', name: 'Gold Ad', price: '20,000', numPrice: 20000, meta: 'App homepage banner placement', group: 'ad' },
]

export default function SubscriptionScreen() {
  const navigate = useNavigate()
  const { currentUser, updateProfile } = useAuth()
  
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [processing, setProcessing] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  
  const [promoCode, setPromoCode] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)

  const isProvider = currentUser?.role === 'doctor' || currentUser?.role === 'nurse'
  const isPartner = currentUser?.role === 'partner'
  const isSubscribed = Boolean(currentUser?.is_subscribed)

  // Provider details (Revenue Stream 3)
  const providerFee = currentUser?.role === 'doctor' ? 5000 : 3000
  const providerFeatures = currentUser?.role === 'doctor' 
    ? ['Verified badge', 'Profile listing', 'Consultation income', 'Ratings & reviews', 'Priority visibility']
    : ['Verified badge', 'Profile listing', 'Consultation income', 'Rating system']

  useEffect(() => {
    if (currentUser?.id) {
      fetchLiveBalance(currentUser.id).then((bal) => setWalletBalance(bal || 0))
    }
  }, [currentUser?.id])

  useEffect(() => {
    if (!selectedPlanId) {
      if (isPartner) setSelectedPlanId('list_gold')
      else if (!isProvider) setSelectedPlanId('bronze')
    }
  }, [isPartner, isProvider, selectedPlanId])

  const activePlan = isPartner 
    ? partnerPlans.find(p => p.id === selectedPlanId)
    : patientPlans.find(p => p.id === selectedPlanId)

  const cost = isProvider ? providerFee : (activePlan?.numPrice || 0)
  const planName = isProvider ? `Provider Registration (${currentUser?.role})` : activePlan?.name

  const handleSubscription = async () => {
    if (processing) return
    setProcessing(true)

    try {
      if (walletBalance < cost) {
        showAssistant({
          title: 'Insufficient Balance',
          message: `You need NGN ${cost.toLocaleString()} to purchase this plan. Please top up your Echo Wallet first.`,
          avatar: 'nurse',
          durationMs: 5000,
        })
        navigate('/app/wallet-add-funds')
        return
      }

      showAssistant({
        title: 'Processing Payment',
        message: `Deducting NGN ${cost.toLocaleString()} from your Echo Wallet...`,
        avatar: 'nurse',
        durationMs: 3500,
      })

      // Call N8N Webhook to securely process subscription and deduct balance
      const res = await fetch(process.env.NEXT_PUBLIC_N8N_SUBSCRIBE_WEBHOOK || 'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          email: currentUser.email,
          amount: cost,
          new_balance: walletBalance - cost,
          plan_name: planName
        })
      })

      if (!res.ok) {
        throw new Error('Failed to process subscription')
      }
      
      const newBalance = walletBalance - cost
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)
      
      // Update local state
      updateProfile({ 
        is_subscribed: true, 
        subscription_expires_at: expiresAt.toISOString(),
        wallet_balance: newBalance 
      }).catch(console.error)
      setWalletBalance(newBalance)

      showAssistant({
        title: 'Payment Successful!',
        message: isProvider ? 'Your provider profile is now active.' : 'Your plan has been activated successfully!',
        avatar: 'nurse',
        durationMs: 5000,
      })

    } catch (err) {
      console.error(err)
      showAssistant({
        title: 'Payment Failed',
        message: 'Could not process payment. Please try again.',
        avatar: 'nurse',
        durationMs: 5000,
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || applyingPromo) return
    setApplyingPromo(true)

    try {
      showAssistant({ title: 'Verifying', message: 'Checking your code...', avatar: 'nurse', durationMs: 2500 })
      
      const res = await fetch(process.env.NEXT_PUBLIC_N8N_APPLY_PROMO_WEBHOOK || 'https://n8n-ftwl.srv1798513.hstgr.cloud/webhook/ee-apply-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase(), user_id: currentUser.id })
      })

      const data = await res.json()
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired code.')
      }

      showAssistant({ title: 'Success!', message: data.message || 'Promo code applied!', avatar: 'nurse', durationMs: 5000 })
      setPromoCode('')
      
      // If they used a subscription code, it bypassed wallet logic
      // Refreshing the page or state manually here is good
      if (data.message.toLowerCase().includes('subscription')) {
        updateProfile({ is_subscribed: true }).catch(console.error)
      } else {
        updateProfile({ promo_balance: Number(currentUser?.promo_balance || 0) + 1000 }).catch(console.error)
      }
      
    } catch (err) {
      showAssistant({ title: 'Code Error', message: err.message, avatar: 'nurse', durationMs: 4000 })
    } finally {
      setApplyingPromo(false)
    }
  }

  const renderBalanceWidget = () => (
    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Wallet Balance</span>
        <span style={{ fontWeight: 900, color: walletBalance >= cost ? '#16A34A' : '#DC2626' }}>
          NGN {walletBalance.toLocaleString()}
        </span>
      </div>
      {walletBalance < cost && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#DC2626', fontWeight: 700 }}>
          Insufficient balance. Please top up your wallet first.
        </p>
      )}
    </div>
  )

  const renderPayButton = () => (
    <Footer>
      <Button 
        type="button" 
        onClick={handleSubscription}
        disabled={processing}
        style={walletBalance < cost ? { background: '#DC2626' } : {}}
      >
        {processing ? 'Processing...' : walletBalance < cost ? 'Top Up Wallet First' : `Pay NGN ${cost.toLocaleString()} Now`}
      </Button>
    </Footer>
  )

  // --- DOCTOR / NURSE VIEW ---
  if (isProvider) {
    return (
      <Screen>
        <Header>
          <InPageMenuButton />
          <Title>Provider Registration</Title>
          <BackBtn type="button" onClick={() => navigate('/app/home')} aria-label="Back">{'<'}</BackBtn>
        </Header>
        <Wrap>
          <Section as={Card} style={{ margin: 0, border: '0', background: 'transparent', boxShadow: 'none' }}>
            <PromoBox>
              <PromoInput 
                placeholder="Have a provider invite code?" 
                value={promoCode} 
                onChange={e => setPromoCode(e.target.value)} 
              />
              <PromoBtn disabled={applyingPromo || !promoCode} onClick={handleApplyPromo}>
                {applyingPromo ? '...' : 'Apply'}
              </PromoBtn>
            </PromoBox>

            <SuggestionLabel><Bulb />Required for Access</SuggestionLabel>
            <SuggestionTitle>Activate your Provider Profile</SuggestionTitle>
            <SuggestionBody>
              EmergencyEcho connects you to a ready-made patient base. We act as your marketing team, appointment system, and payment processor.
            </SuggestionBody>
            <PlanGrid style={{ gridTemplateColumns: '1fr' }}>
              <Plan $active={true} style={{ cursor: 'default' }}>
                <PlanName>{currentUser.role === 'doctor' ? 'Doctor Registration' : 'Nurse Registration'}</PlanName>
                <PlanPrice>NGN {providerFee.toLocaleString()} / mo</PlanPrice>
                <PlanMeta>Auto-deducted from wallet</PlanMeta>
                <BestTag><Dot /> Verified Provider</BestTag>
              </Plan>
            </PlanGrid>
            <SubTitle>What You Get</SubTitle>
            <FeatureList>
              {providerFeatures.map((feature, i) => <FeatureItem key={i}>{feature}</FeatureItem>)}
            </FeatureList>
            {renderBalanceWidget()}
          </Section>
          {isSubscribed ? (
            <Footer><Button type="button" disabled style={{ background: '#16A34A' }}>Active Subscription ✅</Button></Footer>
          ) : renderPayButton()}
        </Wrap>
      </Screen>
    )
  }

  // --- PARTNER VIEW (NGOs, Pharmacies) ---
  if (isPartner) {
    return (
      <Screen>
        <Header>
          <InPageMenuButton />
          <Title>Partner Advertising</Title>
          <BackBtn type="button" onClick={() => navigate('/app/home')} aria-label="Back">{'<'}</BackBtn>
        </Header>
        <Wrap>
          <Section as={Card} style={{ margin: 0, border: '0', background: 'transparent', boxShadow: 'none' }}>
            <SuggestionLabel><Bulb />B2B Revenue</SuggestionLabel>
            <SuggestionTitle>Reach Health-Motivated Users</SuggestionTitle>
            <SuggestionBody>
              Purchase sponsored directory listings or in-app display ads to immediately boost your brand visibility.
            </SuggestionBody>

            <SubTitle style={{ marginTop: 0 }}>Sponsored Listings</SubTitle>
            <PlanGrid style={{ gridTemplateColumns: '1fr 1fr' }}>
              {partnerPlans.filter(p => p.group === 'listing').map(p => (
                <Plan key={p.id} $active={selectedPlanId === p.id} onClick={() => setSelectedPlanId(p.id)}>
                  <PlanName>{p.name}</PlanName>
                  <PlanPrice>NGN {p.price}</PlanPrice>
                  <PlanMeta>{p.meta}</PlanMeta>
                  {p.id === 'list_gold' && <BestTag><Dot /> Priority</BestTag>}
                </Plan>
              ))}
            </PlanGrid>

            <SubTitle>In-App Display Ads</SubTitle>
            <PlanGrid style={{ gridTemplateColumns: '1fr 1fr' }}>
              {partnerPlans.filter(p => p.group === 'ad').map(p => (
                <Plan key={p.id} $active={selectedPlanId === p.id} onClick={() => setSelectedPlanId(p.id)}>
                  <PlanName>{p.name}</PlanName>
                  <PlanPrice>NGN {p.price}</PlanPrice>
                  <PlanMeta>{p.meta}</PlanMeta>
                  {p.id === 'ad_gold' && <BestTag><Dot /> High Rotation</BestTag>}
                </Plan>
              ))}
            </PlanGrid>

            {renderBalanceWidget()}
          </Section>
          {renderPayButton()}
        </Wrap>
      </Screen>
    )
  }

  // --- PATIENT VIEW (Users) ---
  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <Title>Subscription Plans</Title>
        <BackBtn type="button" onClick={() => navigate('/app/home')} aria-label="Back">{'<'}</BackBtn>
      </Header>
      <Wrap>
        <Section as={Card} style={{ margin: 0, border: '0', background: 'transparent', boxShadow: 'none' }}>
          
          <PromoBox>
            <PromoInput 
              placeholder="Have an invite or promo code?" 
              value={promoCode} 
              onChange={e => setPromoCode(e.target.value)} 
            />
            <PromoBtn disabled={applyingPromo || !promoCode} onClick={handleApplyPromo}>
              {applyingPromo ? '...' : 'Apply'}
            </PromoBtn>
          </PromoBox>

          <SuggestionLabel><Bulb />Cost Saving</SuggestionLabel>
          <SuggestionTitle>Save with a Monthly Plan</SuggestionTitle>
          <SuggestionBody>
            Stop paying per consultation. Upgrade to a plan and get free monthly consults, priority queuing, and discounts.
          </SuggestionBody>

          <SubTitle style={{ marginTop: 0 }}>Individual Plans</SubTitle>
          <PlanGrid>
            {patientPlans.filter(p => p.group === 'individual').map(p => (
              <Plan key={p.id} $active={selectedPlanId === p.id} onClick={() => setSelectedPlanId(p.id)}>
                <PlanName>{p.name}</PlanName>
                <PlanPrice>N{p.price}</PlanPrice>
                <PlanMeta>{p.meta}</PlanMeta>
                {p.id === 'silver' && <BestTag><Dot /> Best Value</BestTag>}
              </Plan>
            ))}
          </PlanGrid>

          <SubTitle>Family Plans (Up to 6 People)</SubTitle>
          <PlanGrid style={{ gridTemplateColumns: '1fr' }}>
            {patientPlans.filter(p => p.group === 'family').map(p => (
              <Plan style={{ gridTemplateColumns: '1fr auto' }} key={p.id} $active={selectedPlanId === p.id} onClick={() => setSelectedPlanId(p.id)}>
                <div>
                  <PlanName>{p.name}</PlanName>
                  <PlanMeta>{p.meta}</PlanMeta>
                </div>
                <PlanPrice style={{ textAlign: 'right' }}>N{p.price}</PlanPrice>
              </Plan>
            ))}
          </PlanGrid>

          <SubTitle>Corporate Plans</SubTitle>
          <PlanGrid style={{ gridTemplateColumns: '1fr' }}>
            {patientPlans.filter(p => p.group === 'corporate').map(p => (
              <Plan style={{ gridTemplateColumns: '1fr auto' }} key={p.id} $active={selectedPlanId === p.id} onClick={() => setSelectedPlanId(p.id)}>
                <div>
                  <PlanName>{p.name}</PlanName>
                  <PlanMeta>{p.meta}</PlanMeta>
                </div>
                <PlanPrice style={{ textAlign: 'right' }}>N{p.price}</PlanPrice>
              </Plan>
            ))}
          </PlanGrid>

          {renderBalanceWidget()}
        </Section>
        {renderPayButton()}
      </Wrap>
    </Screen>
  )
}
