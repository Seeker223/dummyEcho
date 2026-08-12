import styled from 'styled-components'

const Card = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px;
  display: grid;
  gap: 10px;
`

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`

const Title = styled.div`
  font-weight: 950;
`

const Sub = styled.div`
  margin-top: 3px;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 650;
  font-size: 0.9rem;
  line-height: 1.4;
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 950;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $tone }) => {
    if ($tone === 'verified') return theme.mode === 'dark' ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.10)'
    if ($tone === 'rejected') return theme.mode === 'dark' ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.10)'
    return theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.colors.surfaceAlt
  }};
  color: ${({ theme, $tone }) => {
    if ($tone === 'verified') return theme.mode === 'dark' ? '#86efac' : '#166534'
    if ($tone === 'rejected') return theme.mode === 'dark' ? '#fecaca' : '#7f1d1d'
    return theme.colors.text
  }};
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
`

const Input = styled.input`
  flex: 1 1 240px;
`

const Select = styled.select`
  flex: 1 1 240px;
  border-radius: 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 12px;
  font-weight: 800;
`

import { useState } from 'react'

export function UploadCard({
  title,
  subtitle,
  status = 'pending',
  onPickFile,
  accept = '*/*',
  children,
}) {
  const [isUploading, setIsUploading] = useState(false)
  const tone = status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : status === 'missing' ? 'missing' : 'pending'
  
  return (
    <Card>
      <Top>
        <div style={{ minWidth: 0 }}>
          <Title>{title}</Title>
          {subtitle ? <Sub>{subtitle}</Sub> : null}
        </div>
        <Badge $tone={tone}>{status}</Badge>
      </Top>

      {children}

      <Row>
        <Input
          type="file"
          accept={accept}
          disabled={isUploading}
          onChange={async (e) => {
            const file = e.target.files && e.target.files[0]
            if (!file) return
            setIsUploading(true)
            try {
              await onPickFile?.(file)
            } finally {
              setIsUploading(false)
              e.target.value = ''
            }
          }}
        />
        {isUploading && <span style={{ fontWeight: 800, color: '#00B3C6', fontSize: '0.9rem' }}>Uploading...</span>}
      </Row>
    </Card>
  )
}

export const UploadSelect = Select
