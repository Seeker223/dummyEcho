import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { Card, Screen, Subtitle, Title } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`

const List = styled.div`
  display: grid;
  gap: 10px;
`

const UserCard = styled(Card)`
  cursor: default;
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 16px;
`

const Avatar = styled.img`
  width: 46px;
  height: 46px;
  border-radius: 14px;
  object-fit: cover;
  flex: 0 0 auto;
  border: 1px solid rgba(220, 38, 38, 0.12);
  background: rgba(15, 23, 42, 0.06);
`

const UserMeta = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`

const RowTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const Name = styled.div`
  font-weight: 900;
  color: ${({ theme }) => theme?.colors?.text || '#0f172a'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 12px;
  color: ${({ $online }) => ($online ? '#0b6b59' : '#6b7280')};
  flex: 0 0 auto;
`

const Dot = styled.span`
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: ${({ $online }) => ($online ? '#22c55e' : '#94a3b8')};
  box-shadow: ${({ $online }) => ($online ? '0 0 0 4px rgba(34, 197, 94, 0.14)' : 'none')};
`

const Detail = styled.div`
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  font-weight: 600;
  font-size: 13px;
`

const RoleWord = styled.span`
  font-weight: 900;
  color: ${({ $role }) => {
    if ($role === 'doctor') return '#16a34a'
    if ($role === 'nurse') return '#2563eb'
    if ($role === 'patient') return '#dc2626'
    return '#0f172a'
  }};
`

function stableIntFromString(input) {
  const raw = String(input || '')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0
  }
  return hash
}

function formatLastSeen(minutesAgo) {
  if (minutesAgo <= 0) return 'just now'
  if (minutesAgo < 60) return `${minutesAgo} min ago`
  const hours = Math.round(minutesAgo / 60)
  return `${hours}h ago`
}

export default function DirectoryScreen() {
  const { users, currentUser } = useAuth()

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <span />
      </Header>
      <Title>Users</Title>
      <Subtitle>People currently registered in the system.</Subtitle>
      <List>
        {users.map((user) => {
          const role = String(user.role || 'user').toLowerCase()
          const seed = stableIntFromString(user.id || user.username || user.email)
          const minutesAgo = (seed % 160) + 1
          const online = currentUser?.id === user.id ? true : seed % 3 === 0
          const lastSeen = online ? 'online now' : `last active ${formatLastSeen(minutesAgo)}`
          return (
            <UserCard key={user.id}>
              <Avatar alt={user.fullName} src={user.avatarUrl || 'https://images.unsplash.com/photo-1520975958225-0c1727c137c4?w=200&h=200&fit=crop'} />
              <UserMeta>
                <RowTop>
                  <Name>{[user.title, user.fullName].filter(Boolean).join(' ')}</Name>
                  <Status $online={online}>
                    <Dot $online={online} />
                    {lastSeen}
                  </Status>
                </RowTop>
                <Detail>
                  <span>@{user.username}</span>
                  <span>*</span>
                  <span>
                    <RoleWord $role={role}>{role || 'user'}</RoleWord>
                  </span>
                  <span>*</span>
                  <span>{user.email}</span>
                </Detail>
              </UserMeta>
            </UserCard>
          )
        })}
      </List>
    </Screen>
  )
}
