import React from 'react'
import Head from 'next/head'
import PartnerVerificationPortal from '../../features/mdcn/PartnerVerificationPortal'

export default function NMCNNursesPage() {
  return (
    <>
      <Head>
        <title>NMCN Nurse Registry Verification Portal • EmergencyEcho</title>
        <meta name="description" content="Nursing and Midwifery Council of Nigeria (NMCN) authorized partner verification portal." />
      </Head>
      <PartnerVerificationPortal role="nurse" />
    </>
  )
}
