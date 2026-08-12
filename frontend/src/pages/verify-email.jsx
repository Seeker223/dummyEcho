import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
  color: #333;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #0056b3;
  }
`;

const Status = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  ${(props) =>
    props.type === 'success'
      ? `
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `
      : props.type === 'error'
        ? `
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `
        : `
    background-color: #cfe2ff;
    color: #084298;
    border: 1px solid #b6d4fe;
  `}
`;

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!router.isReady) return;

    const { token, code } = router.query;
    const verificationToken = token || code;

    if (!verificationToken) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verificationToken, code: verificationToken }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
  }, [router.isReady, router.query]);

  return (
    <Container>
      <Card>
        <Title>Email Verification</Title>
        <Status type={status}>{message}</Status>
        {status === 'error' && (
          <>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Your verification token may have expired. Please request a new one.
            </p>
            <Button onClick={() => router.push(`/resend-verification?email=${encodeURIComponent(router.query.email || '')}`)}>
              Resend Verification Email
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
}
