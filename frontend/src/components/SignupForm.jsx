import { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  ${(props) =>
    props.type === 'success'
      ? `
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `
      : `
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'patient',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessageType('error');
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setMessageType('error');
      setMessage('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup-all-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage(data.message || 'Signup successful! Please check your email.');
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          full_name: '',
          role: 'patient',
        });
      } else {
        setMessageType('error');
        setMessage(data.error || 'Signup failed');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('An error occurred. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <h2>Create Emergency Echo Account</h2>

      {message && <Message type={messageType}>{message}</Message>}

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="role">Role</Label>
          <Select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="partner">Partner</option>
          </Select>
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
    </FormContainer>
  );
}
