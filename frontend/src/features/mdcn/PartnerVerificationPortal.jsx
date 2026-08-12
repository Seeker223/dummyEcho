import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import * as XLSX from 'xlsx'

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`

// Styled Components
const PortalContainer = styled.div`
  min-height: 100vh;
  background: #090d16;
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }
`

const GlowBackground = styled.div`
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: radial-gradient(circle, rgba(220, 38, 38, 0.25) 0%, rgba(9, 13, 22, 0) 70%);
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
`

const HeaderBar = styled.header`
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 2rem;
`

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const TitleGroup = styled.div`
  h1 {
    font-size: 1.35rem;
    font-weight: 800;
    margin: 0 0 0.25rem 0;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 0.85rem;
    margin: 0;
    color: #94a3b8;
    font-weight: 500;
  }
`

const CouncilBadge = styled.span`
  font-size: 0.7rem;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(220, 38, 38, 0.18);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.35);
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const Button = styled.button`
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  border: none;
  font-family: inherit;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${props => {
    if (props.$variant === 'primary') {
      return `
        background: linear-gradient(135deg, #dc2626, #991b1b);
        color: white;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
        &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.45); }
      `
    }
    if (props.$variant === 'danger') {
      return `
        background: rgba(244, 63, 94, 0.15);
        color: #fb7185;
        border: 1px solid rgba(244, 63, 94, 0.3);
        &:hover:not(:disabled) { background: rgba(244, 63, 94, 0.25); }
      `
    }
    if (props.$variant === 'success') {
      return `
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
      `
    }
    return `
      background: rgba(30, 41, 59, 0.8);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:hover:not(:disabled) { background: rgba(51, 65, 85, 0.8); color: #ffffff; }
    `
  }}
`

const MainContent = styled.main`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
`

const StatCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.$borderColor || 'rgba(255, 255, 255, 0.08)'};
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.$hoverColor || 'rgba(255, 255, 255, 0.2)'};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;

    span.label {
      font-size: 0.75rem;
      font-weight: 700;
      color: ${props => props.$labelColor || '#94a3b8'};
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    span.icon {
      font-size: 1.5rem;
    }
  }

  .value {
    font-size: 2.5rem;
    font-weight: 800;
    color: ${props => props.$valColor || '#ffffff'};
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .sub {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
  }
`

const ToolBar = styled.div`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
`

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 280px;
`

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 240px;
  max-width: 400px;

  span.icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 1rem;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #ffffff;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
  }

  &::placeholder {
    color: #475569;
  }
`

const Select = styled.select`
  padding: 0.75rem 2rem 0.75rem 1rem;
  background: rgba(9, 13, 22, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #e2e8f0;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #ef4444;
  }
`

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const CliniciansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
  animation: ${fadeIn} 0.4s ease;
`

const ClinicianCard = styled.div`
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(14px);
  border: 1px solid ${props => {
    if (props.$status === 'verified') return 'rgba(16, 185, 129, 0.35)';
    if (props.$status === 'not_verified' || props.$status === 'rejected') return 'rgba(244, 63, 94, 0.35)';
    return 'rgba(255, 255, 255, 0.08)';
  }};
  border-radius: 22px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => {
      if (props.$status === 'verified') return 'rgba(16, 185, 129, 0.6)';
      if (props.$status === 'not_verified' || props.$status === 'rejected') return 'rgba(244, 63, 94, 0.6)';
      return 'rgba(255, 255, 255, 0.2)';
    }};
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  gap: 1rem;
`

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${props => props.$status === 'verified' 
    ? 'rgba(16, 185, 129, 0.15)' 
    : 'rgba(30, 41, 59, 0.8)'};
  color: ${props => props.$status === 'verified' ? '#34d399' : '#cbd5e1'};
  border: 1px solid ${props => props.$status === 'verified' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  flex-shrink: 0;
`

const ClinicianName = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.2rem 0;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  p {
    font-size: 0.8rem;
    color: #94a3b8;
    margin: 0;
  }
`

const StatusPill = styled.span`
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;

  ${props => {
    if (props.$status === 'verified') {
      return `background: rgba(6, 78, 59, 0.6); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4);`;
    }
    if (props.$status === 'not_verified' || props.$status === 'rejected') {
      return `background: rgba(136, 19, 55, 0.6); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.4);`;
    }
    return `background: rgba(120, 53, 15, 0.6); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.4);`;
  }}
`

const SpecsBox = styled.div`
  background: rgba(9, 13, 22, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  font-size: 0.82rem;

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span.lbl {
      color: #64748b;
    }
    span.val {
      color: #e2e8f0;
      font-weight: 500;
      text-align: right;
    }
    span.lic {
      font-family: monospace;
      font-weight: 700;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.12);
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
  }
`

const DocsSection = styled.div`
  margin-bottom: 1.5rem;

  p.title {
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 0.65rem 0;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`

const DocPill = styled.button`
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: rgba(51, 65, 85, 1);
    color: #ffffff;
    transform: scale(1.03);
  }

  ${props => {
    if (props.$verified) return `border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.1); color: #34d399;`;
    if (props.$rejected) return `border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.1); color: #fb7185;`;
    return '';
  }}
`

const CardFooter = styled.div`
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 0.75rem;
`

const LoginCard = styled.div`
  max-width: 440px;
  width: 100%;
  margin: auto;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 10;
  animation: ${fadeIn} 0.5s ease;
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: ${fadeIn} 0.2s ease;
`

const ModalCard = styled.div`
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  max-width: ${props => props.$width || '520px'};
  width: 100%;
  padding: 2rem;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  position: relative;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`

const Toast = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 2000;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  background: ${props => props.$type === 'error' ? 'rgba(159, 18, 57, 0.95)' : 'rgba(6, 78, 59, 0.95)'};
  border: 1px solid ${props => props.$type === 'error' ? 'rgba(244, 63, 94, 0.5)' : 'rgba(16, 185, 129, 0.5)'};
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: ${fadeIn} 0.3s ease;
  backdrop-filter: blur(10px);
`

const EmptyState = styled.div`
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 4rem 2rem;
  text-align: center;
  max-width: 600px;
  margin: 3rem auto;

  .icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
  }
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
  }
  p {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0 0 1.5rem 0;
  }
`

const TableView = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  
  th {
    background: rgba(15, 23, 42, 0.9);
    padding: 0.85rem 1rem;
    text-align: left;
    color: #94a3b8;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
  }

  tr:hover td {
    background: rgba(30, 41, 59, 0.4);
  }
`

const SpinnerIcon = styled.span`
  display: inline-block;
  animation: ${spin} 1s linear infinite;
`

const PulseIcon = styled.span`
  display: inline-block;
  animation: ${pulse} 2s infinite;
`

const LoadingCircle = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ef4444;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 1rem auto;
`

export default function PartnerVerificationPortal({ role = 'doctor' }) {
  const isNurse = role === 'nurse'
  const councilName = isNurse ? 'Nursing and Midwifery Council of Nigeria (NMCN)' : 'Medical and Dental Council of Nigeria (MDCN)'
  const portalTitle = isNurse ? 'NMCN Nurse Registry Portal' : 'MDCN Doctor Registry Portal'
  const defaultPin = isNurse ? 'NMCN-NURSE-2026' : 'MDCN-DOC-2026'
  const secondaryPin = isNurse ? 'MDCN-NURSE-2026' : 'MDCN-DOC-2026'

  // Auth state
  const [token, setToken] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [inputPin, setInputPin] = useState('')
  const [authError, setAuthError] = useState('')

  // Data state
  const [clinicians, setClinicians] = useState([])
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, not_verified: 0 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals state
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [rejectModal, setRejectModal] = useState({ open: false, clinician: null, notes: '' })
  const [bulkModal, setBulkModal] = useState({ open: false, records: [], fileName: '', processing: false })
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const fileInputRef = useRef(null)

  // Check saved session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(`mdcn_partner_token_${role}`) || localStorage.getItem('mdcn_partner_token')
    if (savedToken) {
      setToken(savedToken)
      setIsLoggedIn(true)
    }
  }, [role])

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchClinicians()
    }
  }, [isLoggedIn, token, role])

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (!inputPin.trim()) {
      setAuthError('Please enter your Partner Access PIN or Token.')
      return
    }
    const cleanPin = inputPin.trim()
    setToken(cleanPin)
    localStorage.setItem(`mdcn_partner_token_${role}`, cleanPin)
    localStorage.setItem('mdcn_partner_token', cleanPin)
    setIsLoggedIn(true)
    setAuthError('')
  }

  const handleLogout = () => {
    localStorage.removeItem(`mdcn_partner_token_${role}`)
    localStorage.removeItem('mdcn_partner_token')
    setToken('')
    setIsLoggedIn(false)
    setClinicians([])
  }

  const fetchClinicians = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/mdcn/list?role=${role}`, {
        headers: {
          'x-partner-token': token,
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setClinicians(data.clinicians || [])
        setStats(data.stats || { total: 0, verified: 0, pending: 0, not_verified: 0 })
      } else if (res.status === 401 || res.status === 403) {
        setAuthError(data.error || 'Invalid PIN or session expired.')
        handleLogout()
      } else {
        showToastMsg(data.error || 'Failed to fetch clinician registry', 'error')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      showToastMsg('Network error connecting to verification server', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAction = async (clinicianId, targetStatus, notes = '') => {
    try {
      const res = await fetch('/api/mdcn/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-partner-token': token,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: clinicianId,
          role,
          status: targetStatus,
          notes
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToastMsg(`Profile successfully updated to: ${targetStatus === 'verified' ? 'Verified ✓' : 'Not Verified ✕'}`)
        // Update local state instantly
        setClinicians(prev => prev.map(c => {
          if (c.id === clinicianId || c.user_id === clinicianId) {
            return {
              ...c,
              verification_status: targetStatus,
              verified_by_admin: targetStatus === 'verified',
              verification_notes: notes || c.verification_notes
            }
          }
          return c
        }))
        // recalculate stats
        fetchClinicians()
      } else {
        showToastMsg(data.error || 'Verification update failed', 'error')
      }
    } catch (err) {
      console.error('Verify action error:', err)
      showToastMsg('Error updating verification status', 'error')
    }
  }

  const handleOpenRejectModal = (clinician) => {
    setRejectModal({
      open: true,
      clinician,
      notes: clinician.verification_notes || ''
    })
  }

  const handleConfirmReject = () => {
    if (!rejectModal.clinician) return
    const cid = rejectModal.clinician.id || rejectModal.clinician.user_id
    handleVerifyAction(cid, 'not_verified', rejectModal.notes || (isNurse ? 'Not verified by NMCN Council' : 'Not verified by MDCN Council'))
    setRejectModal({ open: false, clinician: null, notes: '' })
  }

  // Spreadsheet Export
  const handleDownloadExcel = () => {
    if (clinicians.length === 0) {
      showToastMsg('No records to export', 'error')
      return
    }
    const exportData = clinicians.map((c, idx) => ({
      'S/N': idx + 1,
      'Full Name': c.full_name,
      'Email': c.email,
      'Phone Number': c.phone_number,
      [isNurse ? 'NMCN License' : 'MDCN Folio Number']: c.license_number || c.license_id || 'N/A',
      'Specialty / Department': c.department || c.certification,
      'Hospital Affiliation': c.hospital_affiliation,
      'Experience (Years)': c.years_of_experience,
      'State': c.state,
      'Verification Status': c.verification_status.toUpperCase(),
      'Verified By Admin': c.verified_by_admin ? 'YES' : 'NO',
      'Verification Notes': c.verification_notes || 'N/A',
      'Uploaded Documents Count': c.documents?.length || 0,
      'Registration Date': new Date(c.created_at).toLocaleDateString()
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, isNurse ? 'Nurse Registry' : 'Doctor Registry')
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 }, { wch: 25 }, { wch: 28 }, { wch: 16 }, { wch: 20 },
      { wch: 24 }, { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 20 },
      { wch: 18 }, { wch: 30 }, { wch: 24 }, { wch: 18 }
    ]

    const filename = `${isNurse ? 'NMCN_Nurse' : 'MDCN_Doctor'}_Registry_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, filename)
    showToastMsg(`Exported ${clinicians.length} records to Excel successfully!`, 'success')
  }

  const handleDownloadCSV = () => {
    if (clinicians.length === 0) {
      showToastMsg('No records to export', 'error')
      return
    }
    const headers = ['Full Name', 'Email', 'Phone Number', isNurse ? 'NMCN License' : 'MDCN Folio Number', 'Department', 'Hospital', 'Verification Status', 'Notes']
    const rows = clinicians.map(c => [
       `"${(c.full_name || '').replace(/"/g, '""')}"`,
       `"${(c.email || '').replace(/"/g, '""')}"`,
       `"${(c.phone_number || '').replace(/"/g, '""')}"`,
       `"${(c.license_number || c.license_id || '').replace(/"/g, '""')}"`,
      `"${(c.department || '').replace(/"/g, '""')}"`,
      `"${(c.hospital_affiliation || '').replace(/"/g, '""')}"`,
      `"${(c.verification_status || '').toUpperCase()}"`,
      `"${(c.verification_notes || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${isNurse ? 'NMCN_Nurses' : 'MDCN_Doctors'}_Registry_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToastMsg('CSV file exported successfully')
  }

  // Spreadsheet Upload & Bulk Verification
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result
        const workbook = XLSX.read(bstr, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (!jsonData || jsonData.length === 0) {
          showToastMsg('Uploaded spreadsheet is empty', 'error')
          return
        }

        setBulkModal({
          open: true,
          records: jsonData,
          fileName: file.name,
          processing: false
        })
      } catch (err) {
        console.error('Error reading file:', err)
        showToastMsg('Failed to read spreadsheet file. Ensure it is a valid .xlsx or .csv', 'error')
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleConfirmBulkUpload = async () => {
    if (bulkModal.records.length === 0) return
    setBulkModal(prev => ({ ...prev, processing: true }))
    try {
      const res = await fetch('/api/mdcn/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-partner-token': token,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          records: bulkModal.records,
          role
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToastMsg(`Bulk upload complete! Updated ${data.updated_count} profiles.`)
        setBulkModal({ open: false, records: [], fileName: '', processing: false })
        fetchClinicians()
      } else {
        showToastMsg(data.error || 'Bulk upload failed', 'error')
        setBulkModal(prev => ({ ...prev, processing: false }))
      }
    } catch (err) {
      console.error('Bulk upload error:', err)
      showToastMsg('Network error during bulk update', 'error')
      setBulkModal(prev => ({ ...prev, processing: false }))
    }
  }

  // Filtered list
  const filteredClinicians = clinicians.filter(c => {
    const matchesSearch = !search.trim() || 
      (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.license_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.hospital_affiliation || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || c.verification_status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!isLoggedIn) {
    return (
      <PortalContainer>
        <GlowBackground $isNurse={isNurse} />
        {toast.show && (
          <Toast $type={toast.type}>
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </Toast>
        )}

        <div style={{ margin: 'auto', padding: '2rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <LoginCard>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <LogoIcon $isNurse={isNurse}>{isNurse ? '🏥' : '⚕️'}</LogoIcon>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', color: '#fff', margin: '0 0 0.5rem 0' }}>
              {portalTitle}
            </h1>
            <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.85rem', margin: '0 0 1.75rem 0' }}>
              {councilName} • Authorized Partner Portal
            </p>

            {authError && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Partner Access PIN or Token
                </label>
                <Input
                  type="password"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder={`e.g. ${defaultPin}`}
                  style={{ textAlign: 'center', letterSpacing: '0.15em', fontSize: '1.1rem', padding: '0.85rem 1rem' }}
                  $isNurse={isNurse}
                />
              </div>

              <Button type="submit" $variant="primary" $isNurse={isNurse} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}>
                <span>Verify Access</span>
                <span>→</span>
              </Button>
            </form>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ⚡ Demo / Quick Access PINs
              </p>
              <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1' }}>
                  <span>{isNurse ? 'Nurse Portal PIN:' : 'Doctor Portal PIN:'}</span>
                  <button 
                    onClick={() => setInputPin(defaultPin)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  >
                    {defaultPin}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1' }}>
                  <span>Secondary PIN:</span>
                  <button 
                    onClick={() => setInputPin(secondaryPin)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  >
                    {secondaryPin}
                  </button>
                </div>
              </div>
            </div>
          </LoginCard>
        </div>
      </PortalContainer>
    )
  }

  return (
    <PortalContainer>
      <GlowBackground $isNurse={isNurse} />

      {/* Toast Notification */}
      {toast.show && (
        <Toast $type={toast.type}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </Toast>
      )}

      {/* Header Bar */}
      <HeaderBar>
        <HeaderContent>
          <BrandGroup>
            <LogoIcon $isNurse={isNurse}>{isNurse ? '🏥' : '⚕️'}</LogoIcon>
            <TitleGroup>
              <h1>
                <span>{portalTitle}</span>
                <CouncilBadge $isNurse={isNurse}>COUNCIL REGISTRY</CouncilBadge>
              </h1>
              <p>{councilName} • Real-time Clinician Accreditation & Triage</p>
            </TitleGroup>
          </BrandGroup>

          <HeaderActions>
            <Button
              onClick={fetchClinicians}
              disabled={loading}
              title="Refresh Live Data"
            >
              {loading ? <SpinnerIcon>🔄</SpinnerIcon> : <span>🔄</span>}
              <span>{loading ? 'Refreshing...' : 'Refresh Registry'}</span>
            </Button>

            <Button
              onClick={handleLogout}
              $variant="danger"
            >
              Sign Out 🔒
            </Button>
          </HeaderActions>
        </HeaderContent>
      </HeaderBar>

      {/* Main Content */}
      <MainContent>
        {/* Stats Grid */}
        <StatsGrid>
          <StatCard $borderColor="rgba(255, 255, 255, 0.08)" $hoverColor="rgba(255, 255, 255, 0.2)">
            <div className="header">
              <span className="label">Total {isNurse ? 'Nurses' : 'Doctors'}</span>
              <span className="icon">📊</span>
            </div>
            <div className="value">{stats.total}</div>
            <div className="sub">Registered in ecosystem</div>
          </StatCard>

          <StatCard $borderColor="rgba(16, 185, 129, 0.25)" $hoverColor="rgba(16, 185, 129, 0.5)" $labelColor="#34d399" $valColor="#34d399">
            <div className="header">
              <span className="label">Verified Profiles</span>
              <span className="icon">✓</span>
            </div>
            <div className="value">{stats.verified}</div>
            <div className="sub">Accredited & practicing</div>
          </StatCard>

          <StatCard $borderColor="rgba(245, 158, 11, 0.25)" $hoverColor="rgba(245, 158, 11, 0.5)" $labelColor="#fbbf24" $valColor="#fbbf24">
            <div className="header">
              <span className="label">Pending Review</span>
              <PulseIcon className="icon">⏳</PulseIcon>
            </div>
            <div className="value">{stats.pending}</div>
            <div className="sub">Awaiting verification</div>
          </StatCard>

          <StatCard $borderColor="rgba(244, 63, 94, 0.25)" $hoverColor="rgba(244, 63, 94, 0.5)" $labelColor="#fb7185" $valColor="#fb7185">
            <div className="header">
              <span className="label">Not Verified</span>
              <span className="icon">✕</span>
            </div>
            <div className="value">{stats.not_verified}</div>
            <div className="sub">Rejected or action required</div>
          </StatCard>
        </StatsGrid>

        {/* Toolbar & Filters */}
        <ToolBar>
          <FilterGroup>
            <SearchInputWrapper>
              <span className="icon">🔍</span>
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, license, email..."
                $isNurse={isNurse}
              />
            </SearchInputWrapper>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              $isNurse={isNurse}
            >
              <option value="all">All Statuses ({clinicians.length})</option>
              <option value="verified">Verified ({stats.verified})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="not_verified">Not Verified ({stats.not_verified})</option>
            </Select>
          </FilterGroup>

          <ActionGroup>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
            />

            <Button onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <span>📤</span>
              <span>Upload Excel / CSV</span>
            </Button>

            <Button onClick={handleDownloadExcel} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span>📥</span>
              <span>Download Excel (.xlsx)</span>
            </Button>

            <Button onClick={handleDownloadCSV} title="Download simple CSV format">
              CSV
            </Button>
          </ActionGroup>
        </ToolBar>

        {/* Clinicians Grid */}
        {loading ? (
          <div style={{ padding: '5rem 0', textAlign: 'center', color: '#94a3b8' }}>
            <LoadingCircle $isNurse={isNurse} />
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Connecting to EmergencyEcho Database & Loading Registry...</p>
          </div>
        ) : filteredClinicians.length === 0 ? (
          <EmptyState>
            <div className="icon">📭</div>
            <h3>No clinicians found</h3>
            <p>No matching {isNurse ? 'nurses' : 'doctors'} found in the current filter selection or EmergencyEcho database.</p>
            <Button onClick={() => { setSearch(''); setStatusFilter('all'); fetchClinicians(); }} $variant="primary" $isNurse={isNurse}>
              Reset Filters & Reload
            </Button>
          </EmptyState>
        ) : (
          <CliniciansGrid>
            {filteredClinicians.map((clinician) => {
              const isVer = clinician.verification_status === 'verified'
              const isRej = clinician.verification_status === 'not_verified' || clinician.verification_status === 'rejected'
              
              return (
                <ClinicianCard key={clinician.id} $status={clinician.verification_status}>
                  <div>
                    {/* Card Header */}
                    <CardHeader>
                      <AvatarGroup>
                        <Avatar $status={clinician.verification_status}>
                          {clinician.full_name?.slice(0, 2).toUpperCase() || (isNurse ? 'RN' : 'DR')}
                        </Avatar>
                        <ClinicianName>
                          <h3>
                            <span>{clinician.full_name}</span>
                            {isVer && <span style={{ color: '#34d399', fontSize: '0.95rem' }} title="Council Verified">✓</span>}
                          </h3>
                          <p>{clinician.email}</p>
                        </ClinicianName>
                      </AvatarGroup>

                      <StatusPill $status={clinician.verification_status}>
                        {isVer ? 'Verified' : isRej ? 'Not Verified' : 'Pending'}
                      </StatusPill>
                    </CardHeader>

                    {/* License & Department Specs */}
                    <SpecsBox>
                      <div className="row">
                        <span className="lbl">{isNurse ? 'NMCN License:' : 'MDCN Folio / License:'}</span>
                        <span className="lic">{clinician.license_number || clinician.license_id || 'PENDING'}</span>
                      </div>
                      <div className="row">
                        <span className="lbl">Specialty / Dept:</span>
                        <span className="val">{clinician.department || clinician.certification}</span>
                      </div>
                      <div className="row">
                        <span className="lbl">Hospital / Facility:</span>
                        <span className="val" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={clinician.hospital_affiliation}>
                          {clinician.hospital_affiliation}
                        </span>
                      </div>
                      <div className="row">
                        <span className="lbl">Experience / State:</span>
                        <span className="val">
                          {clinician.years_of_experience ? `${clinician.years_of_experience} yrs` : 'N/A'} • {clinician.state || 'Nigeria'}
                        </span>
                      </div>
                    </SpecsBox>

                    {/* Verification Notes Alert */}
                    {clinician.verification_notes && (
                      <div style={{ marginBottom: '1.25rem', padding: '0.75rem', borderRadius: '12px', fontSize: '0.78rem', background: isVer ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', border: `1px solid ${isVer ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`, color: isVer ? '#6ee7b7' : '#fda4af', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span>💬</span>
                        <span style={{ lineHeight: 1.4 }}><strong>Note:</strong> {clinician.verification_notes}</span>
                      </div>
                    )}

                    {/* Uploaded Documents List */}
                    <DocsSection>
                      <p className="title">Submitted Credentials ({clinician.documents?.length || 0})</p>
                      <div className="pills">
                        {clinician.documents && clinician.documents.length > 0 ? (
                          clinician.documents.map((doc, idx) => (
                            <DocPill
                              key={doc.id || idx}
                              onClick={() => setSelectedDoc(doc)}
                              $verified={doc.verification_status === 'verified'}
                              $rejected={doc.verification_status === 'rejected' || doc.verification_status === 'not_verified'}
                              title="Click to view/download document"
                            >
                              <span>📄</span>
                              <span style={{ textTransform: 'capitalize' }}>{doc.file_name || doc.document_type || 'Document'}</span>
                              <span>{doc.verification_status === 'verified' ? '✓' : doc.verification_status === 'rejected' ? '✕' : '⏳'}</span>
                            </DocPill>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>No verification documents uploaded yet</span>
                        )}
                      </div>
                    </DocsSection>
                  </div>

                  {/* Action Buttons */}
                  <CardFooter>
                    <Button
                      onClick={() => handleVerifyAction(clinician.id || clinician.user_id, 'verified')}
                      disabled={isVer}
                      $variant={isVer ? 'default' : 'success'}
                      style={{ flex: 1, justifyContent: 'center', opacity: isVer ? 0.7 : 1 }}
                    >
                      <span>{isVer ? 'Verified Profile ✓' : 'Verify Profile ✓'}</span>
                    </Button>

                    <Button
                      onClick={() => handleOpenRejectModal(clinician)}
                      $variant={isRej ? 'danger' : 'default'}
                      style={{ justifyContent: 'center' }}
                    >
                      <span>Not Verified ✕</span>
                    </Button>
                  </CardFooter>
                </ClinicianCard>
              )
            })}
          </CliniciansGrid>
        )}
      </MainContent>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <ModalOverlay>
          <ModalCard $width="580px">
            <ModalHeader>
              <h3>
                <span>📄 {selectedDoc.file_name || selectedDoc.document_type || 'Document Viewer'}</span>
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </ModalHeader>

            <div style={{ background: 'rgba(9, 13, 22, 0.8)', borderRadius: '16px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📑</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '0 0 0.4rem 0' }}>Credential File Reference</h4>
              <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#ef4444', wordBreak: 'break-all', background: 'rgba(239, 68, 68, 0.12)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)', margin: '0 auto 1.25rem auto', maxWidth: '400px' }}>
                {selectedDoc.file_path || 'Uploaded Certificate File Reference'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Status:</span>
                <span style={{ fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>{selectedDoc.verification_status || 'Pending'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button onClick={() => setSelectedDoc(null)}>Close Window</Button>
              {selectedDoc.file_path && (
                <a
                  href={selectedDoc.file_path}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button $variant="primary" $isNurse={isNurse}>
                    <span>Open / Download File</span>
                    <span>↗</span>
                  </Button>
                </a>
              )}
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Reject / Not Verified Modal */}
      {rejectModal.open && (
        <ModalOverlay>
          <ModalCard $width="480px">
            <ModalHeader>
              <h3 style={{ color: '#fb7185' }}>
                <span>✕ Mark Profile as Not Verified</span>
              </h3>
              <button
                onClick={() => setRejectModal({ open: false, clinician: null, notes: '' })}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </ModalHeader>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.25rem 0' }}>
              Specify the reason or action required for <strong style={{ color: '#fff' }}>{rejectModal.clinician?.full_name}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Verification / Rejection Notes
                </label>
                <textarea
                  rows="4"
                  value={rejectModal.notes}
                  onChange={(e) => setRejectModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={isNurse ? "e.g. Expired Annual Practicing License for 2026. Please upload updated certificate from NMCN portal." : "e.g. Expired Annual Practicing License for 2026. Please upload updated certificate from MDCN portal."}
                  style={{ width: '100%', padding: '0.85rem', background: 'rgba(9, 13, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '14px', color: '#fff', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  'Expired Annual License',
                  'Invalid License Number',
                  'Unreadable Degree Certificate',
                  'Pending Council Clearance'
                ].map(reason => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectModal(prev => ({ ...prev, notes: reason }))}
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    + {reason}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button onClick={() => setRejectModal({ open: false, clinician: null, notes: '' })}>Cancel</Button>
              <Button onClick={handleConfirmReject} $variant="danger" style={{ background: '#e11d48', color: '#fff', border: 'none' }}>
                Confirm Not Verified
              </Button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Bulk Upload Modal */}
      {bulkModal.open && (
        <ModalOverlay>
          <ModalCard $width="720px">
            <ModalHeader>
              <h3>
                <span>📤 Bulk Verification Update ({bulkModal.records.length} records)</span>
              </h3>
              <button
                onClick={() => setBulkModal({ open: false, records: [], fileName: '', processing: false })}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </ModalHeader>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 1rem 0' }}>
              Review the imported spreadsheet rows below. The system will match records by <strong style={{ color: '#fff' }}>{isNurse ? 'NMCN License' : 'MDCN Folio Number (e.g. MDCN/R/12345)'}</strong> or <strong style={{ color: '#fff' }}>Email</strong> and update their council status in bulk.
            </p>

            <div style={{ maxHeight: '280px', overflowY: 'auto', background: 'rgba(9, 13, 22, 0.8)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }}>
              <TableView>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{isNurse ? 'NMCN License' : 'MDCN Folio Number'}</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkModal.records.slice(0, 50).map((row, idx) => {
                    const lic = row.license_number || row.license_id || row['License Number'] || row['License ID'] || row['MDCN Folio Number'] || row['MDCN Folio'] || row['NMCN License'] || row['Folio Number'] || 'N/A'
                    const em = row.email || row['Email'] || 'N/A'
                    const st = String(row.status || row.verification_status || row['Status'] || 'verified').toUpperCase()
                    return (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>{lic}</td>
                        <td>{em}</td>
                        <td>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: st === 'VERIFIED' ? 'rgba(6, 78, 59, 0.6)' : 'rgba(136, 19, 55, 0.6)', color: st === 'VERIFIED' ? '#6ee7b7' : '#fda4af' }}>
                            {st}
                          </span>
                        </td>
                        <td style={{ color: '#94a3b8', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.notes || row['Notes'] || 'Bulk Update'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </TableView>
              {bulkModal.records.length > 50 && (
                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', background: 'rgba(15, 23, 42, 0.5)' }}>
                  + {bulkModal.records.length - 50} more rows...
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Button onClick={() => setBulkModal({ open: false, records: [], fileName: '', processing: false })} disabled={bulkModal.processing}>
                Cancel
              </Button>
              <Button onClick={handleConfirmBulkUpload} disabled={bulkModal.processing} $variant="primary" $isNurse={isNurse}>
                {bulkModal.processing ? (
                  <>
                    <SpinnerIcon>🔄</SpinnerIcon>
                    <span>Processing {bulkModal.records.length} Profiles...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Bulk Verification ✓</span>
                  </>
                )}
              </Button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </PortalContainer>
  )
}
