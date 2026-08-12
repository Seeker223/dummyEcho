import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`

const Container = styled.div`
  min-height: 100vh;
  background: #090d16;
  color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }
`

const GlowLeft = styled.div`
  position: absolute;
  top: -100px;
  left: -100px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(220, 38, 38, 0.22) 0%, rgba(9, 13, 22, 0) 70%);
  filter: blur(80px);
  pointer-events: none;
`

const GlowRight = styled.div`
  position: absolute;
  bottom: -100px;
  right: -100px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, rgba(9, 13, 22, 0) 70%);
  filter: blur(80px);
  pointer-events: none;
`

const ContentBox = styled.div`
  max-width: 1000px;
  width: 100%;
  z-index: 10;
  text-align: center;
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
`

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 30px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 640px) {
    font-size: 2rem;
  }
`

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 1.05rem;
  max-width: 680px;
  margin: 0 auto 3.5rem auto;
  line-height: 1.6;

  strong {
    color: #ffffff;
    font-weight: 600;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
`

const Card = styled.a`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 2.5rem 2rem;
  text-align: left;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(220, 38, 38, 0.2);
  }

  .icon-box {
    width: 68px;
    height: 68px;
    border-radius: 20px;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 1.75rem;
    box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
    transition: transform 0.3s ease;
  }

  &:hover .icon-box {
    transform: scale(1.08) rotate(3deg);
  }

  h2 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 0.75rem 0;
    transition: color 0.3s ease;
  }

  &:hover h2 {
    color: #ef4444;
  }

  p {
    color: #94a3b8;
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0 0 2.5rem 0;
  }

  .footer {
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;

    span.action {
      font-size: 0.85rem;
      font-weight: 700;
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    span.pin {
      font-family: monospace;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
    }
  }
`

const FooterNote = styled.div`
  margin-top: 4rem;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.02em;
`

export default function MDCNLandingIndex() {
  return (
    <>
      <Head>
        <title>MDCN & NMCN Partner Verification Portals • EmergencyEcho</title>
        <meta name="description" content="Authorized partner council portals for clinician verification, accreditation, and spreadsheet management." />
      </Head>

      <Container>
        <GlowLeft />
        <GlowRight />

        <ContentBox>
          <Badge>
            <span>🛡️ OFFICIAL COUNCIL ACCESS</span>
          </Badge>

          <Title>Healthcare Professional Verification Portals</Title>
          <Subtitle>
            Welcome to the centralized verification hub for our partners at the <strong>Medical and Dental Council of Nigeria (MDCN)</strong> and the <strong>Nursing and Midwifery Council of Nigeria (NMCN)</strong>. Select your designated council registry below.
          </Subtitle>

          <Grid>
            {/* Doctors Card */}
            <Link href="/mdcn/doctors" passHref legacyBehavior>
              <Card>
                <div>
                  <div className="icon-box">⚕️</div>
                  <h2>Doctor Verification Portal</h2>
                  <p>
                    Access the MDCN Doctor Registry to verify practicing licenses, download registry reports in Excel (.xlsx), upload bulk accreditation spreadsheets, and review medical degrees.
                  </p>
                </div>

                <div className="footer">
                  <span className="action">Enter Doctor Registry →</span>
                  <span className="pin">PIN: MDCN-DOC-2026</span>
                </div>
              </Card>
            </Link>

            {/* Nurses Card */}
            <Link href="/mdcn/nurses" passHref legacyBehavior>
              <Card $isNurse>
                <div>
                  <div className="icon-box">🏥</div>
                  <h2>Nurse Verification Portal</h2>
                  <p>
                    Access the NMCN Nurse Registry to accredit registered nurses and midwives, verify annual practicing certificates, export spreadsheet registries, and review credentials.
                  </p>
                </div>

                <div className="footer">
                  <span className="action">Enter Nurse Registry →</span>
                  <span className="pin">PIN: NMCN-NURSE-2026</span>
                </div>
              </Card>
            </Link>
          </Grid>

          <FooterNote>
            EmergencyEcho Council Integration Engine • Secured with 256-bit TLS & Role-based Access Control
          </FooterNote>
        </ContentBox>
      </Container>
    </>
  )
}
