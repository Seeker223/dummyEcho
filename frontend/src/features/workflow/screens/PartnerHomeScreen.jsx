import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Button, Card, FieldLabel, Screen, SelectField, TextField } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { AiStarButton } from '../components/AiStarButton'

const STORAGE_KEY = 'ee:partner:listings:v1'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 2px 12px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const TitleBlock = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

const Title = styled.div`
  font-weight: 900;
  letter-spacing: -0.03em;
  font-size: clamp(0.95rem, 3.5vw, 1.25rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Sub = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const EditPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px);
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: clamp(0.7rem, 2.5vw, 0.9rem);
  cursor: pointer;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 6px ${({ theme }) => theme.colors.glowRed};
  }
`

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 8px;

  @media (min-width: 920px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const StatCard = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px 14px;
  box-shadow: ${({ theme }) => theme.shadow.soft};
  text-align: center;
  animation: ${fadeUp} 240ms ease both;
`

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#33d6b7' : theme.colors.text)};
`

const StatLabel = styled.div`
  margin-top: 4px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 700;
`

const CardTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
  font-size: 1.05rem;
`

const CardSub = styled.div`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 750;
  font-size: 0.92rem;
`

const StatusBanner = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)')};
  margin-top: 14px;
`

const StatusCopy = styled.div`
  display: grid;
  gap: 4px;
`

const StatusTitle = styled.div`
  font-weight: 900;
  letter-spacing: -0.02em;
`

const StatusText = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 650;
  font-size: 0.92rem;
  line-height: 1.45;
`

const StatusPill = styled.span`
  flex: 0 0 auto;
  padding: 8px 12px;
  border-radius: 999px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(34,197,94,0.18)' : '#dcfce7')};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#86efac' : '#166534')};
  font-size: 0.82rem;
  font-weight: 900;
`

const SectionSplit = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 14px;

  @media (min-width: 920px) {
    grid-template-columns: 1.15fr 0.85fr;
  }
`

const MiniForm = styled.form`
  display: grid;
  gap: 12px;
  margin-top: 12px;
`

const FormRow = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 680px) {
    grid-template-columns: 1fr 1fr;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 96px;
  resize: vertical;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 13px;
  font: inherit;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.glowRed};
  }
`

const ListingList = styled.div`
  display: grid;
  gap: 10px;
`

const ListingItem = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 14px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(15,23,42,0.56)' : '#fff')};
  box-shadow: ${({ theme }) => theme.shadow.soft};
`

const ListingTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`

const ListingName = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
`

const ListingMeta = styled.div`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.45;
`

const ListingPrice = styled.div`
  font-weight: 950;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc')};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.8rem;
  font-weight: 800;
`

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
`

const ActionChip = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff')};
  color: ${({ theme }) => theme.colors.text};
  padding: 9px 12px;
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 800;
`

const ToggleRow = styled.button`
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: 999px;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text)};
  padding: 8px 12px;
  font-size: 0.84rem;
  font-weight: 850;
  cursor: pointer;
`

const RevenueRail = styled.div`
  display: grid;
  gap: 10px;
`

const RevenueCard = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#fff')};
  padding: 14px;
`

const RevenueLabel = styled.div`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
  font-weight: 750;
`

const RevenueValue = styled.div`
  margin-top: 4px;
  font-size: 1.3rem;
  font-weight: 950;
  letter-spacing: -0.02em;
`

const QuickGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`

const QuickBtn = styled.button`
  min-height: 46px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(2, 6, 23, 0.45)' : 'rgba(255,255,255,0.9)')};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 900;
  letter-spacing: -0.01em;
  text-align: left;
  padding: 12px 12px;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.ring};
    outline-offset: 2px;
  }
`

const emptyDraft = {
  name: '',
  type: 'Product',
  category: 'Pharmacy',
  price: '',
  fulfillment: 'Same day delivery',
  description: '',
}

const defaultListings = [
  {
    id: 'partner-listing-1',
    name: 'Emergency Triage Consultation',
    type: 'Service',
    category: 'Telemedicine',
    price: '₦12,500',
    fulfillment: 'Instant video session',
    description:
      'Verified clinicians can offer quick triage and post-call follow-up for urgent health concerns.',
    featured: true,
    status: 'Active',
  },
  {
    id: 'partner-listing-2',
    name: 'Home Lab Sample Pickup',
    type: 'Service',
    category: 'Lab',
    price: '₦8,000',
    fulfillment: 'Within 2 hours',
    description:
      'Book a lab partner to collect samples at home and upload results directly to the patient record.',
    featured: true,
    status: 'Active',
  },
  {
    id: 'partner-listing-3',
    name: 'Blood Pressure Monitor',
    type: 'Product',
    category: 'Wellness',
    price: '₦28,500',
    fulfillment: 'Delivery within Lagos',
    description:
      'A partner-supplied home monitoring device for patients managing hypertension and follow-up care.',
    featured: false,
    status: 'Active',
  },
]

function safeLoadListings() {
  if (typeof window === 'undefined') return defaultListings
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultListings
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : defaultListings
  } catch {
    return defaultListings
  }
}

export default function PartnerHomeScreen() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [listings, setListings] = useState(() => safeLoadListings())
  const [draft, setDraft] = useState(emptyDraft)
  const [publishing, setPublishing] = useState(false)

  const partnerName = currentUser?.fullName || currentUser?.name || 'Partner'
  const isVerifiedPartner = Boolean(
    currentUser?.verified_by_admin ||
      currentUser?.is_verified ||
      String(currentUser?.verification_status || '').toLowerCase() === 'verified',
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
    } catch {
      // ignore persistence issues in prototype mode
    }
  }, [listings])

  const stats = useMemo(
    () => [
      { key: 'orders', value: '18', label: 'Orders Today' },
      { key: 'revenue', value: 'NGN 84,500', label: 'Revenue Today' },
      { key: 'open', value: '7', label: 'Open Requests' },
      { key: 'listings', value: String(listings.length), label: 'Live Listings' },
    ],
    [listings.length],
  )

  const featuredListings = useMemo(() => listings.filter((item) => item.featured), [listings])

  const handlePublish = (event) => {
    event.preventDefault()
    if (!draft.name.trim() || !draft.price.trim() || !draft.description.trim()) return

    setPublishing(true)
    const nextListing = {
      id: `partner-listing-${Date.now()}`,
      name: draft.name.trim(),
      type: draft.type,
      category: draft.category,
      price: draft.price.trim(),
      fulfillment: draft.fulfillment.trim(),
      description: draft.description.trim(),
      featured: false,
      status: 'Active',
    }

    setListings((current) => [nextListing, ...current])
    setDraft(emptyDraft)
    setPublishing(false)
  }

  const toggleFeatured = (id) => {
    setListings((current) => current.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)))
  }

  const pauseListing = (id) => {
    setListings((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: item.status === 'Paused' ? 'Active' : 'Paused' } : item,
      ),
    )
  }

  return (
    <Screen>
      <Header>
        <HeaderLeft>
          <InPageMenuButton />
          <TitleBlock>
            <Title>Partner Marketplace Hub</Title>
            <Sub>{partnerName}</Sub>
          </TitleBlock>
        </HeaderLeft>
        <HeaderRight>
          <AiStarButton />
          <EditPill type="button" onClick={() => navigate('/app/profile')} aria-label="Edit profile">
            Edit profile
          </EditPill>
        </HeaderRight>
      </Header>

      <StatusBanner>
        <StatusCopy>
          <StatusTitle>{isVerifiedPartner ? 'Verified partner storefront live' : 'Partner verification pending'}</StatusTitle>
          <StatusText>
            {isVerifiedPartner
              ? 'You can publish products and services directly into the EmergencyEcho marketplace.'
              : 'Your listings are saved locally for now. Once admin verification is complete, your storefront can go live.'}
          </StatusText>
        </StatusCopy>
        <StatusPill>{isVerifiedPartner ? 'Verified' : 'Pending'}</StatusPill>
      </StatusBanner>

      <Grid aria-label="Partner metrics">
        {stats.map((item) => (
          <StatCard key={item.key}>
            <StatValue>{item.value}</StatValue>
            <StatLabel>{item.label}</StatLabel>
          </StatCard>
        ))}
      </Grid>

      <SectionSplit>
        <Card as="section" aria-label="Partner listing composer">
          <CardTitle>Publish a listing</CardTitle>
          <CardSub>Sell products, services, or care packages from your verified partner storefront.</CardSub>

          <MiniForm onSubmit={handlePublish}>
            <FormRow>
              <div>
                <FieldLabel htmlFor="partner-listing-name">Listing name</FieldLabel>
                <TextField
                  id="partner-listing-name"
                  value={draft.name}
                  onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
                  placeholder="e.g. Family Malaria Test Pack"
                />
              </div>
              <div>
                <FieldLabel htmlFor="partner-listing-type">Type</FieldLabel>
                <SelectField
                  id="partner-listing-type"
                  value={draft.type}
                  onChange={(e) => setDraft((current) => ({ ...current, type: e.target.value }))}
                >
                  <option>Product</option>
                  <option>Service</option>
                  <option>Package</option>
                </SelectField>
              </div>
            </FormRow>

            <FormRow>
              <div>
                <FieldLabel htmlFor="partner-listing-category">Category</FieldLabel>
                <SelectField
                  id="partner-listing-category"
                  value={draft.category}
                  onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}
                >
                  <option>Pharmacy</option>
                  <option>Lab</option>
                  <option>Telemedicine</option>
                  <option>Wellness</option>
                  <option>Clinic</option>
                  <option>Diagnostics</option>
                </SelectField>
              </div>
              <div>
                <FieldLabel htmlFor="partner-listing-price">Price</FieldLabel>
                <TextField
                  id="partner-listing-price"
                  value={draft.price}
                  onChange={(e) => setDraft((current) => ({ ...current, price: e.target.value }))}
                  placeholder="e.g. ₦15,000"
                />
              </div>
            </FormRow>

            <div>
              <FieldLabel htmlFor="partner-listing-fulfillment">Fulfillment</FieldLabel>
              <TextField
                id="partner-listing-fulfillment"
                value={draft.fulfillment}
                onChange={(e) => setDraft((current) => ({ ...current, fulfillment: e.target.value }))}
                placeholder="e.g. Same-day delivery / In-clinic / Virtual"
              />
            </div>

            <div>
              <FieldLabel htmlFor="partner-listing-description">Description</FieldLabel>
              <TextArea
                id="partner-listing-description"
                value={draft.description}
                onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
                placeholder="Describe what the customer gets, who it helps, and how the service is delivered."
              />
            </div>

            <Button type="submit" disabled={publishing || !draft.name.trim() || !draft.price.trim() || !draft.description.trim()}>
              {publishing ? 'Publishing...' : 'Publish listing'}
            </Button>
          </MiniForm>
        </Card>

        <RevenueRail>
          <RevenueCard>
            <RevenueLabel>Storefront overview</RevenueLabel>
            <RevenueValue>{partnerName}</RevenueValue>
            <CardSub style={{ marginTop: 6 }}>Manage products, services, requests, and payouts in one place.</CardSub>
            <BadgeRow>
              <Badge>Storefront</Badge>
              <Badge>Verified partner</Badge>
              <Badge>Marketplace-ready</Badge>
            </BadgeRow>
          </RevenueCard>

          <RevenueCard>
            <RevenueLabel>Quick actions</RevenueLabel>
            <CardActions>
              <ActionChip type="button" onClick={() => navigate('/app/marketplace')}>
                Open marketplace
              </ActionChip>
              <ActionChip type="button" onClick={() => window.dispatchEvent(new Event('ee:open-nav'))}>
                Open menu
              </ActionChip>
              <ActionChip type="button" onClick={() => navigate('/app/profile')}>
                Update profile
              </ActionChip>
              <ActionChip type="button" onClick={() => navigate('/app/wallet')}>
                Revenue wallet
              </ActionChip>
            </CardActions>
          </RevenueCard>
        </RevenueRail>
      </SectionSplit>

      <Card as="section" aria-label="Featured partner listings" style={{ marginTop: 14 }}>
        <CardTitle>Featured listings</CardTitle>
        <CardSub>These listings are visible in the public marketplace and can be featured on the homepage.</CardSub>
        <ListingList style={{ marginTop: 12 }}>
          {(featuredListings.length ? featuredListings : listings).slice(0, 4).map((item) => (
            <ListingItem key={item.id}>
              <ListingTop>
                <div>
                  <ListingName>{item.name}</ListingName>
                  <ListingMeta>
                    {item.type} • {item.category} • {item.fulfillment}
                  </ListingMeta>
                </div>
                <ListingPrice>{item.price}</ListingPrice>
              </ListingTop>
              <ListingMeta style={{ marginTop: 10 }}>{item.description}</ListingMeta>
              <BadgeRow>
                <Badge>{item.status}</Badge>
                <Badge>{item.featured ? 'Featured' : 'Standard listing'}</Badge>
              </BadgeRow>
              <CardActions>
                <ToggleRow type="button" $active={item.featured} onClick={() => toggleFeatured(item.id)}>
                  {item.featured ? 'Unfeature' : 'Feature'}
                </ToggleRow>
                <ToggleRow type="button" $active={item.status === 'Paused'} onClick={() => pauseListing(item.id)}>
                  {item.status === 'Paused' ? 'Resume' : 'Pause'}
                </ToggleRow>
                <ActionChip type="button" onClick={() => navigate('/app/marketplace')}>
                  View in marketplace
                </ActionChip>
              </CardActions>
            </ListingItem>
          ))}
        </ListingList>
      </Card>

      <Card aria-label="Partner quick actions" style={{ marginTop: 14 }}>
        <CardTitle>Operational shortcuts</CardTitle>
        <CardSub>Keep the storefront active and handle requests from the same home screen.</CardSub>
        <QuickGrid>
          <QuickBtn type="button" onClick={() => navigate('/app/marketplace')}>
            Browse public marketplace
          </QuickBtn>
          <QuickBtn type="button" onClick={() => navigate('/app/notifications')}>
            Seller notifications
          </QuickBtn>
          <QuickBtn type="button" onClick={() => navigate('/app/wallet')}>
            Revenue wallet
          </QuickBtn>
          <QuickBtn type="button" onClick={() => navigate('/app/profile')}>
            Store profile
          </QuickBtn>
        </QuickGrid>
      </Card>
    </Screen>
  )
}
