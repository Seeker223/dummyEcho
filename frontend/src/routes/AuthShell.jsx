import styled from 'styled-components'
import emergencyLogo from '../assets/emergencyecho.png'
import { imageSource } from '../shared/utils/imageSource'

const emergencyLogoSrc = imageSource(emergencyLogo)

const Shell = styled.main`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  transition: background 300ms ease, color 300ms ease;
`

const Grid = styled.section`
  display: grid;
  min-height: 100vh;

  @media (min-width: 980px) {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    height: 100vh;
  }
`

const BrandPane = styled.aside`
  display: none;

  @media (min-width: 980px) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 40px;
    gap: 18px;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }
`

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Logo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  background: white;
  padding: 4px;
  box-sizing: border-box;
`

const BrandName = styled.div`
  font-weight: 900;
  letter-spacing: -0.03em;
  font-size: 1.3rem;
  color: white;
`

const BrandCopy = styled.p`
  margin: 0;
  max-width: 26rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
  font-weight: 600;
  font-size: 0.95rem;
`

const BrandImage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
`

const BrandImageInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const BrandTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: white;
  font-size: 0.85rem;
`

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: white;
  flex-shrink: 0;
`

const PaneTitle = styled.h2`
  margin: 0;
  font-size: 2.6rem;
  line-height: 1.15;
  letter-spacing: -0.05em;
  font-weight: 900;
  color: white;
`

const PaneSub = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.65;
  font-weight: 500;
  max-width: 36rem;
  font-size: 0.95rem;
`

const PaneFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const PaneFeature = styled.li`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  padding-left: 20px;
  position: relative;

  &:before {
    content: '*';
    position: absolute;
    left: 0;
    font-weight: 900;
  }
`

const PaneFooter = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.75rem;
  font-weight: 500;
`

const ContentPane = styled.section`
  padding: 18px;
  display: grid;
  align-content: start;
  justify-items: stretch;

  @media (min-width: 680px) {
    padding: 28px;
  }

  @media (min-width: 980px) {
    padding: 48px;
    align-content: start;
    height: 100vh;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
`

const ContentCard = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`

const ContentHeader = styled.header`
  padding: 0 0 18px;
  display: grid;
  gap: 6px;
`

const ContentTitle = styled.h1`
  margin: 0;
  font-size: 1.65rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme?.colors?.text};
`

const ContentSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.muted || '#6b7280'};
  line-height: 1.55;
  font-size: 0.95rem;
`

export function AuthShell({ children, title, subtitle }) {
  return (
    <Shell>
      <Grid>
        <BrandPane>
          <div>
            <BrandRow>
              <Logo alt="Emergency Echo logo" src={emergencyLogoSrc} />
              <BrandName>EmergencyEcho</BrandName>
            </BrandRow>
          </div>
          
          <BrandImage>
            <BrandImageInner>
              <PaneTitle>When every second counts.</PaneTitle>
              <PaneSub>Voice-activated AI triage, encrypted medical records, and verified clinicians - instantly.</PaneSub>
              <PaneFeatures>
                <PaneFeature>One-tap emergency activation</PaneFeature>
                <PaneFeature>AI conversational triage</PaneFeature>
                <PaneFeature>Digital Emergency ID & QR</PaneFeature>
              </PaneFeatures>
            </BrandImageInner>
          </BrandImage>
          
          <PaneFooter>(c) 2026 EmergencyEcho - A Yenak Technology product</PaneFooter>
        </BrandPane>
        <ContentPane>
          <ContentCard>
            {title || subtitle ? (
              <ContentHeader>
                {title ? <ContentTitle>{title}</ContentTitle> : null}
                {subtitle ? <ContentSubtitle>{subtitle}</ContentSubtitle> : null}
              </ContentHeader>
            ) : null}
            {children}
          </ContentCard>
        </ContentPane>
      </Grid>
    </Shell>
  )
}

