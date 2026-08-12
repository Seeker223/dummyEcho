import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppState } from '../../../app/context/useAppState'
import { useAuth } from '../../auth/context/useAuth'
import { Button, Card, Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { resolveEchoId } from '../utils/echoId'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`

const CircleButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.1rem, 4vw, 1.4rem);
`

const Spacer = styled.span`
  width: 36px;
`

const ProfileSection = styled.section`
  display: grid;
  justify-items: center;
  margin-bottom: 16px;
`

const AvatarWrap = styled.div`
  position: relative;
`

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  object-fit: cover;
  margin-bottom: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
`

const UploadButton = styled.button`
  position: absolute;
  right: -6px;
  bottom: 8px;
  border: 0;
  border-radius: 999px;
  width: 30px;
  height: 30px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  cursor: pointer;
`

const HiddenInput = styled.input`
  display: none;
`

const UserName = styled.h3`
  margin: 0;
  font-size: clamp(1.15rem, 4vw, 1.45rem);
`

const IdentityRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${({ $bg }) => $bg || '#f1f5f9'};
  color: ${({ $color }) => $color || '#475569'};
  border: 1px solid ${({ $border }) => $border || 'transparent'};
  letter-spacing: 0.02em;
`

const InlineEditButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(15, 31, 68, 0.1);

  svg {
    width: 15px;
    height: 15px;
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(220,38,38,0.14)' : 'rgba(220,38,38,0.06)')};
    }
  }
`

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: clamp(1rem, 3.5vw, 1.15rem);
`

const EditCard = styled(Card)`
  margin-bottom: 12px;
  padding: 14px;
`

const EditTitle = styled.h4`
  margin: 0 0 10px;
`

const FormGrid = styled.div`
  display: grid;
  gap: 10px;
`

const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
`

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 12px;
`

const FormActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

const SecondaryBtn = styled(Button)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
`

const SettingsCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 8px 0;
`

const SettingsItem = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const IconCircle = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: ${({ $bg }) => $bg || '#eee'};
  color: ${({ $color }) => $color || '#222'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
`

const TextWrap = styled.div`
  min-width: 0;
`

const ItemTitle = styled.p`
  margin: 0;
  font-weight: 700;
`

const ItemSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 0.84rem;
  color: ${({ theme }) => theme.colors.muted};
`

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: 0 16px;
`

const RightText = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.1rem;
`

const Toggle = styled.button`
  width: 48px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: ${({ $on }) => ($on ? '#16a34a' : '#cbd5e1')};
  position: relative;
  cursor: pointer;
`

const ToggleKnob = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $on }) => ($on ? '23px' : '3px')};
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #fff;
  transition: left 180ms ease;
`

function ProfileRow({ item, onAction }) {
  const isToggle = item.type === 'toggle'
  return (
    <SettingsItem
      as={isToggle ? 'div' : 'button'}
      onClick={() => {
        if (!isToggle) onAction(item)
      }}
      type={isToggle ? undefined : 'button'}
    >
      <Left>
        <IconCircle $bg={item.bg} $color={item.iconColor}>
          {item.icon}
        </IconCircle>
        <TextWrap>
          <ItemTitle>{item.title}</ItemTitle>
          <ItemSubtitle>{item.subtitle}</ItemSubtitle>
        </TextWrap>
      </Left>
      {isToggle ? (
        <Toggle
          aria-label={item.title}
          $on={item.value}
          onClick={(event) => {
            event.stopPropagation()
            onAction(item)
          }}
          type="button"
        >
          <ToggleKnob $on={item.value} />
        </Toggle>
      ) : (
        <RightText>{'>'}</RightText>
      )}
    </SettingsItem>
  )
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { setActivePage, isDarkMode, setDarkMode, setSelectedRole, setKitStep, locationEnabled, setLocationEnabled } = useAppState()
  const { currentUser, logout, updateProfile, uploadAvatar } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    title: currentUser?.title || '',
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    age: currentUser?.age || '',
  })

  const onSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile(form)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const onPickImage = () => {
    fileInputRef.current?.click()
  }

  const onImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsSaving(true)
    try {
      if (uploadAvatar) {
        await uploadAvatar(file)
      } else {
        // Fallback if useAuth doesn't expose it
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            updateProfile({ avatarUrl: reader.result }).catch(console.error)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const settings = useMemo(
    () => [
      {
        id: 'basic',
        type: 'link',
        title: 'Basic Information',
        subtitle: 'Edit your profile details',
        icon: 'i',
        bg: '#FFF4CC',
        iconColor: '#E6A700',
      },
      {
        id: 'medical',
        type: 'link',
        title: 'Medical Information',
        subtitle: 'Open your emergency kit and records',
        icon: 'M',
        bg: '#E6F0FF',
        iconColor: '#2D6CDF',
      },
      {
        id: 'contact',
        type: 'link',
        title: 'Emergency Contact',
        subtitle: 'Manage emergency contact options',
        icon: 'E',
        bg: '#E6F0FF',
        iconColor: '#2D6CDF',
      },
      {
        id: 'password',
        type: 'link',
        title: 'Password',
        subtitle: 'Manage account password and access',
        icon: 'P',
        bg: '#FFE6E6',
        iconColor: '#D90429',
      },
      {
        id: 'notifications',
        type: 'link',
        title: 'Notifications',
        subtitle: 'View alerts and communication history',
        icon: 'N',
        bg: '#FFF0E6',
        iconColor: '#FF8C42',
      },
      {
        id: 'dark-mode',
        type: 'toggle',
        title: 'Dark mode',
        subtitle: 'Switch app appearance',
        icon: 'D',
        bg: '#E6FBFF',
        iconColor: '#00B3C6',
        value: isDarkMode,
      },
      {
        id: 'location',
        type: 'toggle',
        title: 'Location Services',
        subtitle: 'Enable location support',
        icon: 'L',
        bg: '#E6FBFF',
        iconColor: '#00B3C6',
        value: locationEnabled,
      },
      {
        id: 'logout',
        type: 'link',
        title: isLoggingOut ? 'Logging out...' : 'Log me out',
        subtitle: 'Return to the log in page',
        icon: 'O',
        bg: '#FFE6F0',
        iconColor: '#E11D48',
      },
    ],
    [isDarkMode, locationEnabled, isLoggingOut],
  )

  const onAction = async (item) => {
    if (item.id === 'dark-mode') {
      setDarkMode(!isDarkMode)
      return
    }
    if (item.id === 'location') {
      setLocationEnabled((prev) => !prev)
      return
    }
    if (item.id === 'basic') {
      navigate('/app/profile-basic')
      return
    }
    if (item.id === 'medical') {
      setKitStep(1)
      setActivePage('kit')
      return
    }
    if (item.id === 'contact') {
      setKitStep(2)
      setActivePage('kit')
      return
    }
    if (item.id === 'password') {
      navigate('/app/profile-password')
      return
    }
    if (item.id === 'notifications') {
      navigate('/app/profile-notifications')
      return
    }
    if (item.id === 'logout') {
      if (isLoggingOut) return
      setIsLoggingOut(true)
      try {
        await logout()
        setSelectedRole(null)
        navigate('/login')
      } finally {
        setIsLoggingOut(false)
      }
    }
  }

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <CircleButton
          onClick={() => setActivePage('home')}
          type="button"
        >
          {'<'}
        </CircleButton>
        <HeaderTitle>My Profile</HeaderTitle>
        <Spacer />
      </Header>

      <ProfileSection>
        <AvatarWrap>
          <Avatar
            alt="Profile avatar"
            src={
              currentUser?.avatar_url ||
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop'
            }
          />
          <UploadButton onClick={onPickImage} type="button">
            E
          </UploadButton>
          <HiddenInput accept="image/*" onChange={onImageChange} ref={fileInputRef} type="file" />
        </AvatarWrap>
        <IdentityRow>
          <UserName>{[currentUser?.title, currentUser?.fullName || currentUser?.full_name || currentUser?.name || 'New Patient'].filter(Boolean).join(' ')}</UserName>
          <InlineEditButton
            aria-label="Edit profile details"
            onClick={() => setIsEditing((prev) => !prev)}
            type="button"
          >
            <EditIcon />
          </InlineEditButton>
        </IdentityRow>
        <BadgeRow>
          <Badge 
            $bg={currentUser?.email_confirmed_at || currentUser?.email_verified ? '#dcfce7' : '#fef3c7'}
            $color={currentUser?.email_confirmed_at || currentUser?.email_verified ? '#166534' : '#92400e'}
            $border={currentUser?.email_confirmed_at || currentUser?.email_verified ? '#bbf7d0' : '#fde68a'}
          >
            {currentUser?.email_confirmed_at || currentUser?.email_verified ? '✓ Verified' : '⚠ Unverified'}
          </Badge>
        <Badge $bg="#f1f5f9" $color="#334155" $border="#e2e8f0">
            {`ID: ${resolveEchoId(currentUser)}`}
        </Badge>
      </BadgeRow>
      </ProfileSection>

      {isEditing ? (
        <EditCard>
          <EditTitle>Edit Profile</EditTitle>
          <FormGrid>
            <Field>
              Title
              <Input
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                value={form.title}
              />
            </Field>
            <Field>
              Full name
              <Input
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                value={form.fullName}
              />
            </Field>
            <Field>
              Email
              <Input
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                type="email"
                value={form.email}
              />
            </Field>
            <Field>
              Phone
              <Input
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                value={form.phone}
              />
            </Field>
            <Field>
              Age
              <Input
                onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                value={form.age}
              />
            </Field>
            <Field>
              Profile photo
              <Input
                accept="image/*"
                onChange={onImageChange}
                type="file"
              />
            </Field>
            <FormActions>
              <SecondaryBtn onClick={() => setIsEditing(false)} type="button">
                Cancel
              </SecondaryBtn>
              <Button disabled={isSaving} onClick={onSaveProfile} type="button">
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </FormActions>
          </FormGrid>
        </EditCard>
      ) : null}

      <SectionTitle>Profile settings</SectionTitle>
      <SettingsCard>
        {settings.map((item, index) => (
          <div key={item.id}>
            <ProfileRow item={item} onAction={onAction} />
            {index < settings.length - 1 ? <Divider /> : null}
          </div>
        ))}
      </SettingsCard>
    </Screen>
  )
}
