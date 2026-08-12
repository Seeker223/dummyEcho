import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { addWalletTransaction, deleteWalletTransaction, getWalletSummary, getWalletTransactions } from '../services/walletService'
import {
  AdminBackBtn,
  AdminBadge,
  AdminBtn,
  AdminCard,
  AdminCardSub,
  AdminCardTitle,
  AdminGrid,
  AdminHeader,
  AdminHeaderLeft,
  AdminInput,
  AdminItem,
  AdminItemSub,
  AdminItemTitle,
  AdminRow,
  AdminSelect,
  AdminStatCard,
  AdminStatLabel,
  AdminStatValue,
  AdminSub,
  AdminTable,
  AdminTitle,
  AdminTitleBlock,
  AdminTwoCol,
  AdminSmallBtn,
} from './admin/AdminPrimitives'

export default function AdminWalletScreen() {
  const navigate = useNavigate()
  const [tx, setTx] = useState(() => getWalletTransactions())
  const summary = useMemo(() => getWalletSummary(tx), [tx])
  const [draft, setDraft] = useState({ title: '', amount: '', type: 'credit' })

  const addTx = () => {
    const next = addWalletTransaction({
      title: draft.title || 'Transaction',
      amount: draft.amount || '+NGN 0',
      type: draft.type || 'credit',
      status: 'Successful',
    })
    setTx(next)
    setDraft({ title: '', amount: '', type: 'credit' })
  }

  const removeTx = (id) => {
    const next = deleteWalletTransaction(id)
    setTx(next)
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
            <AdminTitle>Admin: Wallet</AdminTitle>
            <AdminSub>Dashboard and transaction CRUD</AdminSub>
          </AdminTitleBlock>
        </AdminHeaderLeft>
        <div style={{ width: 44 }} />
      </AdminHeader>

      <AdminCard aria-label="Admin wallet dashboard">
        <AdminCardTitle>Wallet dashboard</AdminCardTitle>
        <AdminCardSub>Summary + simulated transaction CRUD (local only).</AdminCardSub>

        <AdminGrid aria-label="Wallet stats">
          <AdminStatCard>
            <AdminStatValue>{`NGN ${summary.balance.toLocaleString()}`}</AdminStatValue>
            <AdminStatLabel>Balance</AdminStatLabel>
          </AdminStatCard>
          <AdminStatCard>
            <AdminStatValue>{`NGN ${summary.credits.toLocaleString()}`}</AdminStatValue>
            <AdminStatLabel>Total credits</AdminStatLabel>
          </AdminStatCard>
          <AdminStatCard>
            <AdminStatValue>{`NGN ${summary.debits.toLocaleString()}`}</AdminStatValue>
            <AdminStatLabel>Total debits</AdminStatLabel>
          </AdminStatCard>
          <AdminStatCard>
            <AdminStatValue>{summary.count}</AdminStatValue>
            <AdminStatLabel>Transactions</AdminStatLabel>
          </AdminStatCard>
        </AdminGrid>

        <AdminTwoCol>
          <div>
            <AdminCardTitle style={{ marginTop: 2 }}>Add transaction</AdminCardTitle>
            <AdminCardSub>Quickly simulate a credit/debit.</AdminCardSub>
            <AdminRow>
              <AdminInput value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Title (e.g., Wallet Top-up)" />
              <AdminSelect value={draft.type} onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))}>
                <option value="credit">credit</option>
                <option value="debit">debit</option>
              </AdminSelect>
            </AdminRow>
            <AdminRow>
              <AdminInput
                value={draft.amount}
                onChange={(e) => setDraft((p) => ({ ...p, amount: e.target.value }))}
                placeholder="Amount (e.g., +NGN 2,000 or -NGN 500)"
              />
              <AdminBtn type="button" onClick={addTx}>
                Add
              </AdminBtn>
            </AdminRow>
          </div>

          <div>
            <AdminCardTitle style={{ marginTop: 2 }}>Latest transactions</AdminCardTitle>
            <AdminCardSub>Remove to simulate chargebacks, reversals, etc.</AdminCardSub>
            <AdminTable>
              {tx.slice(0, 12).map((t) => (
                <AdminItem key={t.id}>
                  <div style={{ minWidth: 0 }}>
                    <AdminItemTitle>{t.title}</AdminItemTitle>
                    <AdminItemSub>{t.date}</AdminItemSub>
                    {t.status ? <AdminItemSub>{t.status}</AdminItemSub> : null}
                  </div>
                  <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                    <AdminBadge>{t.amount}</AdminBadge>
                    <AdminSmallBtn type="button" onClick={() => removeTx(t.id)}>
                      Remove
                    </AdminSmallBtn>
                  </div>
                </AdminItem>
              ))}
            </AdminTable>
          </div>
        </AdminTwoCol>
      </AdminCard>
    </Screen>
  )
}

