import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { pages as allPages } from '../constants/pages'
import {
  AdminBackBtn,
  AdminCard,
  AdminCardSub,
  AdminCardTitle,
  AdminHeader,
  AdminHeaderLeft,
  AdminSub,
  AdminSwitch,
  AdminTitle,
  AdminTitleBlock,
  AdminToggleGrid,
  AdminToggleRow,
  AdminToggleSub,
  AdminToggleText,
  AdminToggleTitle,
} from './admin/AdminPrimitives'

function loadDisabledPages() {
  try {
    const raw = window.localStorage.getItem('ee:admin:disabledPages:v1')
    const parsed = raw ? JSON.parse(raw) : null
    const ids = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.ids) ? parsed.ids : []
    return ids.map((id) => String(id || '').trim()).filter(Boolean)
  } catch {
    return []
  }
}

function saveDisabledPages(ids) {
  try {
    window.localStorage.setItem('ee:admin:disabledPages:v1', JSON.stringify({ ids }))
    window.dispatchEvent(new Event('ee:admin:disabled-pages'))
  } catch {
    // ignore
  }
}

export default function AdminPagesScreen() {
  const navigate = useNavigate()
  const [disabledPages, setDisabledPages] = useState(() => loadDisabledPages())

  const togglePageDisabled = (pageId) => {
    setDisabledPages((prev) => {
      const next = prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
      saveDisabledPages(next)
      return next
    })
  }

  return (
    <Screen>
      <AdminHeader>
        <AdminHeaderLeft>
          <InPageMenuButton />
          <AdminBackBtn type="button" onClick={() => navigate('/app/admin')} aria-label="Back">
            {'<'}
          </AdminBackBtn>
          <AdminTitleBlock>
            <AdminTitle>Admin: Pages</AdminTitle>
            <AdminSub>Enable/disable authenticated pages</AdminSub>
          </AdminTitleBlock>
        </AdminHeaderLeft>
        <div style={{ width: 44 }} />
      </AdminHeader>

      <AdminCard aria-label="Admin pages">
        <AdminCardTitle>Pages</AdminCardTitle>
        <AdminCardSub>Disabled pages are removed from nav and blocked from direct access.</AdminCardSub>
        <AdminToggleGrid>
          {allPages
            .filter((p) => p.isPrivate && p.id !== 'admin' && p.id !== 'forbidden')
            .map((p) => {
              const off = disabledPages.includes(p.id)
              return (
                <AdminToggleRow key={p.id}>
                  <AdminToggleText>
                    <AdminToggleTitle>{p.label}</AdminToggleTitle>
                    <AdminToggleSub>
                      /app/{p.id} {off ? '- Disabled' : '- Active'}
                    </AdminToggleSub>
                  </AdminToggleText>
                  <AdminSwitch type="button" $on={!off} onClick={() => togglePageDisabled(p.id)}>
                    {off ? 'OFF' : 'ON'}
                  </AdminSwitch>
                </AdminToggleRow>
              )
            })}
        </AdminToggleGrid>
      </AdminCard>
    </Screen>
  )
}

