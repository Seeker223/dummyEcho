import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0f172a',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  message: {
    marginTop: '20px',
    fontSize: '1.1rem',
    color: '#e2e8f0',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: '20px',
    fontSize: '1.1rem',
    color: '#dc2626',
    textAlign: 'center',
    maxWidth: '400px',
    lineHeight: '1.5',
  },
  checkmark: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    color: '#dc2626',
  },
}

/**
 * Paystack Callback Page
 * 
 * Redirected to after Paystack payment completion
 * Handles verification and wallet crediting
 */
export default function PaystackCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [error, setError] = useState(null)

  useEffect(() => {
    const verify = async () => {
      try {
        // Extract reference from URL query params
        const reference = searchParams.get('reference') || searchParams.get('transactionRef')

        if (!reference) {
          throw new Error('No transaction reference found. Payment may not have been completed.')
        }

        console.log('[v0] Verifying Paystack transaction:', reference)

        // Verify with backend
        const verifyRes = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference,
            type: 'topup', // or 'consultation' depending on context
          })
        })

        const result = await verifyRes.json()

        if (!verifyRes.ok) {
          throw new Error(result.error || 'Payment verification failed')
        }

        console.log('[v0] Payment verified:', result)

        // Give a moment for state to update, then redirect
        setStatus('success')
        setTimeout(() => {
          router.push('/app/wallet')
        }, 2000)

      } catch (err) {
        console.error('[v0] Paystack callback error:', err)
        setError(err.message || 'Payment verification failed')
        setStatus('error')
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.container}>
        {status === 'verifying' && (
          <>
            <div style={styles.spinner} />
            <p style={styles.message}>Verifying your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.checkmark}>✓</div>
            <p style={styles.message}>Payment successful! Wallet updated. Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <p style={styles.errorMessage}>{error}</p>
            <button
              onClick={() => router.push('/app/wallet')}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Go to Wallet
            </button>
          </>
        )}
      </div>
    </>
  )
}
