import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Screen } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'
import { deletePlan, getPlans, togglePlanActive, upsertPlan } from '../services/planService'
import {
  AdminBackBtn,
  AdminBadge,
  AdminBtn,
  AdminCard,
  AdminCardSub,
  AdminCardTitle,
  AdminCheck,
  AdminHeader,
  AdminHeaderLeft,
  AdminInput,
  AdminItem,
  AdminItemSub,
  AdminItemTitle,
  AdminRow,
  AdminSelect,
  AdminSub,
  AdminTable,
  AdminTitle,
  AdminTitleBlock,
  AdminTwoCol,
  AdminSmallBtn,
} from './admin/AdminPrimitives'

export default function AdminPlansScreen() {
  const navigate = useNavigate()
  const [planState, setPlanState] = useState(() => getPlans())
  const [planDraft, setPlanDraft] = useState(() => ({
    list: 'plans',
    id: '',
    name: '',
    price: '',
    meta: '',
    active: true,
  }))

  const savePlan = () => {
    const next = upsertPlan(planDraft.list, {
      id: planDraft.id || undefined,
      name: planDraft.name,
      price: planDraft.price,
      meta: planDraft.meta,
      active: planDraft.active,
    })
    setPlanState(next)
    setPlanDraft((p) => ({ ...p, id: '', name: '', price: '', meta: '' }))
  }

  const removePlan = (list, id) => {
    const next = deletePlan(list, id)
    setPlanState(next)
  }

  const flipPlanActive = (list, id) => {
    const next = togglePlanActive(list, id)
    setPlanState(next)
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
            <AdminTitle>Admin: Plans</AdminTitle>
            <AdminSub>Subscription plans CRUD</AdminSub>
          </AdminTitleBlock>
        </AdminHeaderLeft>
        <div style={{ width: 44 }} />
      </AdminHeader>

      <AdminCard aria-label="Admin plans">
        <AdminCardTitle>Plans</AdminCardTitle>
        <AdminCardSub>CRUD subscription plans shown on the Upgrade page (local only).</AdminCardSub>

        <AdminTwoCol>
          <div>
            <AdminCardTitle style={{ marginTop: 2 }}>Plan CRUD</AdminCardTitle>
            <AdminCardSub>Create/update a plan in either list.</AdminCardSub>
            <AdminRow>
              <AdminSelect value={planDraft.list} onChange={(e) => setPlanDraft((p) => ({ ...p, list: e.target.value }))}>
                <option value="plans">Core plans</option>
                <option value="familyPlans">Family plans</option>
              </AdminSelect>
              <AdminInput value={planDraft.id} onChange={(e) => setPlanDraft((p) => ({ ...p, id: e.target.value }))} placeholder="Plan id (optional)" />
            </AdminRow>
            <AdminRow>
              <AdminInput value={planDraft.name} onChange={(e) => setPlanDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Plan name" />
              <AdminInput
                value={planDraft.price}
                onChange={(e) => setPlanDraft((p) => ({ ...p, price: e.target.value }))}
                placeholder="Price (e.g., NGN 6,500 / mo)"
              />
            </AdminRow>
            <AdminRow>
              <AdminInput value={planDraft.meta} onChange={(e) => setPlanDraft((p) => ({ ...p, meta: e.target.value }))} placeholder="Meta (e.g., Best value)" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AdminCheck type="checkbox" checked={Boolean(planDraft.active)} onChange={(e) => setPlanDraft((p) => ({ ...p, active: e.target.checked }))} />
                <span style={{ fontWeight: 850, color: 'inherit' }}>Active</span>
              </div>
              <AdminBtn type="button" onClick={savePlan}>
                Save plan
              </AdminBtn>
            </AdminRow>
          </div>

          <div>
            <AdminCardTitle style={{ marginTop: 2 }}>Existing plans</AdminCardTitle>
            <AdminCardSub>Toggle or remove.</AdminCardSub>
            <AdminTable>
              {['plans', 'familyPlans'].map((list) => (
                <div key={list}>
                  <AdminItem style={{ alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <AdminItemTitle>{list === 'plans' ? 'Core plans' : 'Family plans'}</AdminItemTitle>
                      <AdminItemSub>{(planState[list] || []).length} items</AdminItemSub>
                    </div>
                    <AdminBadge>{list}</AdminBadge>
                  </AdminItem>
                  {(planState[list] || []).map((p) => (
                    <AdminItem key={p.id}>
                      <div style={{ minWidth: 0 }}>
                        <AdminItemTitle>{p.name}</AdminItemTitle>
                        <AdminItemSub>{p.price}</AdminItemSub>
                        {p.meta ? <AdminItemSub>{p.meta}</AdminItemSub> : null}
                      </div>
                      <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                        <AdminBtn type="button" onClick={() => flipPlanActive(list, p.id)}>
                          {p.active ? 'ON' : 'OFF'}
                        </AdminBtn>
                        <AdminSmallBtn
                          type="button"
                          onClick={() =>
                            setPlanDraft({
                              list,
                              id: p.id,
                              name: p.name,
                              price: p.price,
                              meta: p.meta,
                              active: Boolean(p.active),
                            })
                          }
                        >
                          Edit
                        </AdminSmallBtn>
                        <AdminSmallBtn type="button" onClick={() => removePlan(list, p.id)}>
                          Remove
                        </AdminSmallBtn>
                      </div>
                    </AdminItem>
                  ))}
                </div>
              ))}
            </AdminTable>
          </div>
        </AdminTwoCol>
      </AdminCard>
    </Screen>
  )
}

