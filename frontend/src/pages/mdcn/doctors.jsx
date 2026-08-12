import React from 'react'
import Head from 'next/head'
import PartnerVerificationPortal from '../../features/mdcn/PartnerVerificationPortal'

export default function MDCNDoctorsPage() {
  return (
    <>
      <Head>
        <title>MDCN Doctor Registry Verification Portal • EmergencyEcho</title>
        <meta name="description" content="Medical and Dental Council of Nigeria (MDCN) authorized partner portal for verifying doctors and clinicians." />
      </Head>
      <PartnerVerificationPortal role="doctor" />
    </>
  )
}
