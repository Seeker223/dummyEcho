import React from 'react'
import Head from 'next/head'
import PartnerVerificationPortal from '../../features/mdcn/PartnerVerificationPortal'

export default function MDCNNursesPage() {
  return (
    <>
      <Head>
        <title>NMCN Nurse Registry Verification Portal • EmergencyEcho</title>
        <meta name="description" content="Authorized council partner portal for verifying registered nurses and midwives in Nigeria." />
      </Head>
      <PartnerVerificationPortal role="nurse" />
    </>
  )
}
