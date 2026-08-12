import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Screen, Card, Button, FieldLabel, SelectField } from './ScreenPrimitives'
import { InPageMenuButton } from '../components/InPageMenuButton'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const BackBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 900;
`

const Title = styled.h2`
  margin: 0 0 6px;
  font-size: 1.35rem;
`

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  line-height: 1.55;
`

const LANG_KEY = 'ee_language'

export default function LanguageScreen() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(() => {
    try {
      return window.localStorage.getItem('ee_language') || 'English'
    } catch {
      return 'English'
    }
  })

  const languageMap = {
    English: 'en',
    Pidgin: 'pcm',
    Yoruba: 'yo',
    Igbo: 'ig',
    Hausa: 'ha'
  }

  const onSave = () => {
    try {
      window.localStorage.setItem('ee_language', language)
      const code = languageMap[language] || 'en'
      if (code === 'en') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname
      } else {
        document.cookie = `googtrans=/en/${code}; path=/;`
      }
      window.location.href = '/app/home'
    } catch {
      navigate('/app/home')
    }
  }

  return (
    <Screen>
      <Header>
        <InPageMenuButton />
        <BackBtn type="button" onClick={() => navigate('/app/home')} aria-label="Back">
          {'<'}
        </BackBtn>
        <div style={{ width: 44 }} />
      </Header>

      <Card>
        <Title>Language / Ede</Title>
        <Subtitle>Choose your preferred language for the app experience (UI-only for now).</Subtitle>

        <div style={{ height: 14 }} />
        <FieldLabel htmlFor="language">Language</FieldLabel>
        <SelectField id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option>English</option>
          <option>Pidgin</option>
          <option>Yoruba</option>
          <option>Igbo</option>
          <option>Hausa</option>
        </SelectField>

        <div style={{ height: 14 }} />
        <Button type="button" onClick={onSave}>
          Save preference
        </Button>
      </Card>
    </Screen>
  )
}

