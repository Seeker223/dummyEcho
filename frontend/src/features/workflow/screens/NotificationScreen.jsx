import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../auth/context/useAuth'
import { formatRelativeTime, getNotificationsForUser, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../services/notificationService'

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`

const Header = styled.div`
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    font-size: 2.2rem;
    font-weight: 950;
    margin: 0;
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'linear-gradient(135deg, #f87171, #ef4444)' 
      : 'linear-gradient(135deg, #ef4444, #b91c1c)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.muted};
    margin: 8px 0 0;
    font-weight: 600;
  }
`

const MarkAllReadButton = styled.button`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: #fff;
  }
`

const FilterTabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
  }
`

const FilterButton = styled.button`
  padding: 10px 16px;
  border: 1.5px solid ${({ $active, theme }) => ($active ? '#ef4444' : theme.colors.border)};
  border-radius: 999px;
  background: ${({ $active, theme }) => ($active ? '#ef4444' : 'transparent')};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text)};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  white-space: nowrap;

  &:hover {
    border-color: #ef4444;
  }
`

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const NotificationCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ $unread, theme }) => ($unread ? 'rgba(220, 38, 38, 0.05)' : theme.colors.surface)};
  transition: all 200ms ease;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #ef4444;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $unread, theme }) => ($unread ? '#ef4444' : 'transparent')};
  }
`

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $type }) => {
    if ($type === 'alert') return 'rgba(239, 68, 68, 0.1)';
    if ($type === 'message') return 'rgba(239, 68, 68, 0.08)';
    if ($type === 'update') return 'rgba(34, 197, 94, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $type }) => {
    if ($type === 'alert') return '#ef4444';
    if ($type === 'message') return '#f87171';
    if ($type === 'update') return '#22c55e';
    return '#ef4444';
  }};
  font-size: 0.82rem;
  font-weight: 900;
  flex-shrink: 0;
`

const NotificationContent = styled.div`
  flex: 1;

  .title {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
    font-size: 0.95rem;
  }

  .message {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.muted};
    margin: 4px 0 0;
    line-height: 1.4;
  }

  .timestamp {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.muted};
    margin-top: 6px;
  }
`

const UnreadBadge = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
  margin-top: 4px;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const ActionBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme, $isDanger }) => $isDanger ? '#dc2626' : '#ef4444'};
  }
`

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;

  .icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 8px;
  }

  p {
    color: ${({ theme }) => theme.colors.muted};
    margin: 0;
  }
`

function iconForType(type) {
  if (type === 'alert') return '!'
  if (type === 'message') return 'MSG'
  if (type === 'update') return 'UPD'
  return '...'
}

export default function NotificationScreen() {
  const { currentUser } = useAuth()
  const [activeFilter, setActiveFilter] = useState('all')
  const filters = ['all', 'alert', 'message', 'update']
  const [items, setItems] = useState(() => [])

  const userId = currentUser?.id || ''

  useEffect(() => {
    if (!userId) return
    setItems(getNotificationsForUser(userId))
  }, [userId])

  const unreadCount = useMemo(() => items.filter((n) => n.unread).length, [items])

  const filteredNotifications = useMemo(() => {
    const base = activeFilter === 'all' ? items : items.filter((n) => n.type === activeFilter)
    return base.map((n) => ({ ...n, timestamp: formatRelativeTime(n.createdAt), icon: iconForType(n.type) }))
  }, [activeFilter, items])

  return (
    <Container>
      <Header>
        <div>
          <h1>Notifications</h1>
          <p>{unreadCount} unread messages</p>
        </div>
        {unreadCount > 0 && (
          <MarkAllReadButton onClick={() => {
            if (!userId) return
            markAllNotificationsRead(userId)
            setItems(getNotificationsForUser(userId))
          }}>
            Mark all read
          </MarkAllReadButton>
        )}
      </Header>

      <FilterTabs>
        {filters.map((filter) => (
          <FilterButton key={filter} $active={activeFilter === filter} onClick={() => setActiveFilter(filter)} type="button">
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </FilterButton>
        ))}
      </FilterTabs>

      <NotificationList>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              $unread={notification.unread}
              onClick={() => {
                if (!userId) return
                markNotificationRead(userId, notification.id)
                setItems(getNotificationsForUser(userId))
              }}
            >
              <IconContainer $type={notification.type}>{notification.icon}</IconContainer>
              <NotificationContent>
                <p className="title">{notification.title}</p>
                <p className="message">{notification.message}</p>
                <p className="timestamp">{notification.timestamp}</p>
              </NotificationContent>
              <ActionButtons>
                {notification.unread && (
                  <ActionBtn 
                    title="Mark as read"
                    onClick={() => {
                      if (!userId) return
                      markNotificationRead(userId, notification.id)
                      setItems(getNotificationsForUser(userId))
                    }}
                  >
                    <CheckIcon />
                  </ActionBtn>
                )}
                <ActionBtn 
                  $isDanger 
                  title="Delete"
                  onClick={() => {
                    if (!userId) return
                    deleteNotification(userId, notification.id)
                    setItems(getNotificationsForUser(userId))
                  }}
                >
                  <TrashIcon />
                </ActionBtn>
              </ActionButtons>
            </NotificationCard>
          ))
        ) : (
          <EmptyState>
            <div className="icon">🔔</div>
            <h3>No notifications</h3>
            <p>You don't have any notifications yet.</p>
          </EmptyState>
        )}
      </NotificationList>
    </Container>
  )
}

