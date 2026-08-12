# FRONTEND COMPONENTS GUIDE
## Complete React Component Documentation

**Version:** 1.0.0  
**Framework:** Next.js 16.2.6 + React 19  
**Styling:** styled-components 6.3.9

---

## Table of Contents

1. [SignupForm Component](#signupform-component)
2. [DocumentUpload Component](#documentupload-component)
3. [Admin Dashboard](#admin-document-verification-dashboard)
4. [Email Verification Page](#email-verification-page)
5. [Integration Examples](#integration-examples)

---

## SignupForm Component

**File:** `frontend/src/components/SignupForm.jsx`

**Purpose:** Multi-role signup form with validation

### Features

- ✅ Email validation
- ✅ Password strength checking (min 8 chars)
- ✅ Role selection
- ✅ Role-specific fields
- ✅ Real-time validation feedback
- ✅ Error handling
- ✅ Loading states

### Props

```typescript
interface SignupFormProps {
  onSuccess?: (userId: string) => void;
  redirectTo?: string;
  theme?: 'light' | 'dark';
}
```

### Usage Example

```jsx
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <div>
      <h1>Create Account</h1>
      <SignupForm 
        onSuccess={(userId) => {
          console.log('User created:', userId);
          // Redirect to email verification or profile completion
        }}
        redirectTo="/verify-email"
      />
    </div>
  );
}
```

### Form Fields by Role

#### Patient Role
- **Email** (required)
  - Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Error: "Invalid email format"

- **Password** (required)
  - Min length: 8 characters
  - Recommended: Include uppercase, lowercase, numbers, symbols
  - Error: "Password must be at least 8 characters"

- **Full Name** (required)
  - Min length: 2 characters
  - Pattern: `/^[a-zA-Z\s'-]+$/`
  - Error: "Name can only contain letters, spaces, hyphens, and apostrophes"

- **Phone** (optional)
  - Format: International
  - Example: "+234-900-1234567"

#### Doctor Role (Inherits Patient + Additional)
- **Specialization** (required)
  - Dropdown: 20+ specializations
  - Examples: Cardiology, Emergency Medicine, Pediatrics

- **License Number** (required)
  - Format: Free text (e.g., "MDCN/2024/00001")
  - Validation: Must be unique in system

- **Years of Experience** (optional)
  - Number field, 0-70

#### Nurse Role (Inherits Patient + Additional)
- **License Number** (required)
  - Format: Free text (e.g., "NMCN/2024/00001")
  - Validation: Must be unique

- **Specialization** (optional)
  - Dropdown: ICU, Emergency, Pediatric, etc.

#### Partner Role (Inherits Patient + Additional)
- **Company Name** (required)
  - Min length: 3 characters

- **Business Registration Number** (optional)
  - Format: Free text

### Styling

Uses styled-components with responsive design:

```jsx
// Mobile first approach
@media (max-width: 768px) {
  // Mobile styles
}

// Dark mode support
${props => props.theme === 'dark' ? 'background: #1a1a1a;' : ''}
```

### Error Handling

```jsx
// All errors follow this format
{
  field: 'email',
  message: 'Email already exists',
  type: 'error' // 'error' | 'warning' | 'info'
}

// Display example
{errors.email && (
  <ErrorMessage>{errors.email}</ErrorMessage>
)}
```

### API Integration

Calls `POST /api/auth/signup-all-roles`:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "User Name",
  "role": "patient",
  "phone": "+234-900-1234567",
  // ... role-specific fields
}
```

### States

- **idle** - Default state
- **loading** - Submitting form
- **success** - User created successfully
- **error** - Validation or API error

---

## DocumentUpload Component

**File:** `frontend/src/components/DocumentUpload.jsx`

**Purpose:** Upload documents for healthcare professionals

### Features

- ✅ Role-specific document requirements
- ✅ File validation (type, size)
- ✅ Upload progress tracking
- ✅ Status indicators
- ✅ Drag-and-drop support (UI)
- ✅ Error messages
- ✅ Success feedback

### Props

```typescript
interface DocumentUploadProps {
  userId: string;          // UUID of logged-in user
  role: 'doctor' | 'nurse'; // User's role
  onUploadComplete?: (doc: Document) => void;
  onError?: (error: Error) => void;
}
```

### Usage Example

```jsx
import DocumentUpload from '@/components/DocumentUpload';
import { useAuth } from '@/context/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  
  return (
    <div>
      <h2>Upload Your Credentials</h2>
      <DocumentUpload 
        userId={user.id}
        role={user.role}
        onUploadComplete={(doc) => {
          console.log('Document uploaded:', doc);
        }}
      />
    </div>
  );
}
```

### Document Types

#### Doctor (4 Required)
1. **government_id**
   - Accepted formats: National ID, Passport, Driver's License
   - Icon: 🪪

2. **annual_license**
   - Required: MDCN Annual Practicing License
   - Icon: 📋

3. **medical_degree**
   - Required: Bachelor's Degree Certificate
   - Icon: 🎓

4. **registration_certificate**
   - Required: Medical Council Registration
   - Icon: 📜

#### Nurse (3 Required)
1. **government_id**
   - Accepted formats: National ID, Passport, Driver's License
   - Icon: 🪪

2. **annual_license**
   - Required: NMCN Annual Practicing License
   - Icon: 📋

3. **nursing_degree**
   - Required: Nursing Qualification Certificate
   - Icon: 🎓

### File Validation

**Allowed MIME Types:**
```javascript
[
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
```

**File Extensions:**
- `.pdf` - PDF documents
- `.jpg`, `.jpeg` - JPEG images
- `.png` - PNG images
- `.doc` - Word documents
- `.docx` - Word documents (modern)

**Size Limits:**
- Maximum: 10 MB per file
- Recommended: < 5 MB for faster upload

### Upload Progress

```jsx
// Progress display
Progress Bar: [████████░░] 80%

// States
- 0-100: Uploading
- 100: Complete
- Error: Display error message
```

### Component States

**Document Card States:**
- Default: Click to upload
- Uploading: Progress bar shown
- Uploaded: ✓ Uploaded (green)
- Failed: ✗ Failed (red)
- Verified: ✓ Verified (blue) - Admin approved
- Rejected: ✗ Rejected (red) - Admin rejected

### API Integration

Calls `POST /api/documents/upload` (multipart/form-data):

```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('user_id', userId);
formData.append('role', role);
formData.append('document_type', documentType);
```

Response:
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "document_type": "government_id",
    "file_name": "ID.pdf",
    "verification_status": "pending"
  }
}
```

### Error Handling

```jsx
// File type error
"Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG"

// File size error
"File too large. Maximum size is 10MB"

// Upload error
"Upload failed. Please try again."

// Network error
"Network error. Check your connection."
```

### Styling Features

- Responsive grid layout (2 columns on desktop, 1 on mobile)
- Color-coded status badges
- Smooth transitions
- Accessible form design
- Touch-friendly on mobile

---

## Admin Document Verification Dashboard

**File:** `frontend/src/pages/admin/document-verification.jsx`

**Purpose:** Review and approve/reject healthcare professional documents

### Features

- ✅ Document listing with pagination
- ✅ Filter by role and status
- ✅ Detailed review modal
- ✅ Approve/reject with notes
- ✅ Admin-only access
- ✅ Status tracking
- ✅ User information display

### Access Control

**Route Protection:**
```jsx
// Check admin token
const isAdmin = localStorage.getItem('admin_token') === NEXT_PUBLIC_ADMIN_TOKEN;

if (!isAdmin) {
  redirect('/login');
}
```

### Page URL

```
/admin/document-verification
```

### Components

#### Main Dashboard

```jsx
export default function DocumentVerification() {
  // State
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState({
    role: '', // 'doctor' | 'nurse' | ''
    status: '', // 'pending' | 'verified' | 'rejected' | ''
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Features
  // ...
}
```

#### Filters

**Role Filter:**
- All (empty)
- Doctor
- Nurse

**Status Filter:**
- All (empty)
- Pending
- Verified
- Rejected

```jsx
// Filter usage
const query = new URLSearchParams({
  role: filters.role,
  verification_status: filters.status,
  page: page,
  limit: 20
}).toString();

const response = await fetch(`/api/documents/list?${query}`, {
  headers: { 'x-admin-token': adminToken }
});
```

#### Document Table

Columns:
1. **Name** - Professional's full name
2. **Role** - doctor/nurse
3. **Document Type** - government_id, license, etc.
4. **File** - Document file name (clickable)
5. **Upload Date** - ISO format date
6. **Status** - Badge (pending/verified/rejected)
7. **Actions** - Review button

```jsx
<DocumentTable>
  {documents.map(doc => (
    <TableRow key={doc.id}>
      <Cell>{doc.profiles.full_name}</Cell>
      <Cell>{doc.role}</Cell>
      <Cell>{doc.document_type}</Cell>
      <Cell>{doc.file_name}</Cell>
      <Cell>{new Date(doc.created_at).toLocaleDateString()}</Cell>
      <Cell>
        <StatusBadge status={doc.verification_status} />
      </Cell>
      <Cell>
        <Button onClick={() => openModal(doc)}>Review</Button>
      </Cell>
    </TableRow>
  ))}
</DocumentTable>
```

#### Review Modal

Shows when clicking "Review" button:

```jsx
<Modal isOpen={isModalOpen} onClose={closeModal}>
  <ModalHeader>
    <h2>Document Review</h2>
  </ModalHeader>
  
  <ModalBody>
    {/* User Info */}
    <Section>
      <h3>Professional Information</h3>
      <InfoGrid>
        <InfoItem label="Name" value={doc.profiles.full_name} />
        <InfoItem label="Email" value={doc.profiles.email} />
        <InfoItem label="Phone" value={doc.profiles.phone} />
        <InfoItem label="Role" value={doc.role} />
      </InfoGrid>
    </Section>

    {/* Role-Specific Info */}
    {doc.role === 'doctor' && (
      <Section>
        <h3>Medical Credentials</h3>
        <InfoGrid>
          <InfoItem label="Specialization" value={doc.doctors.specialization} />
          <InfoItem label="License #" value={doc.doctors.license_number} />
        </InfoGrid>
      </Section>
    )}

    {/* Document Preview */}
    <Section>
      <h3>Document: {doc.document_type}</h3>
      <DocumentPreview>
        {doc.mime_type.includes('image') && (
          <img src={storageUrl} alt="Document" />
        )}
        {doc.mime_type.includes('pdf') && (
          <iframe src={storageUrl} title="Document" />
        )}
        <DownloadLink href={storageUrl} download>
          Download Document
        </DownloadLink>
      </DocumentPreview>
    </Section>

    {/* Verification Form */}
    <Section>
      <h3>Verification Decision</h3>
      <VerificationForm>
        <div>
          <label>
            <input 
              type="radio" 
              name="status" 
              value="verified"
              onChange={handleStatusChange}
            />
            Approve
          </label>
        </div>
        <div>
          <label>
            <input 
              type="radio" 
              name="status" 
              value="rejected"
              onChange={handleStatusChange}
            />
            Reject
          </label>
        </div>

        {/* Notes - Required for rejection */}
        {status === 'rejected' && (
          <TextArea
            placeholder="Reason for rejection (required)"
            required
            onChange={handleNotesChange}
          />
        )}

        {/* Optional notes for approval */}
        {status === 'verified' && (
          <TextArea
            placeholder="Verification notes (optional)"
            onChange={handleNotesChange}
          />
        )}
      </VerificationForm>
    </Section>
  </ModalBody>

  <ModalFooter>
    <Button variant="secondary" onClick={closeModal}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      Submit Decision
    </Button>
  </ModalFooter>
</Modal>
```

#### Status Badge Component

```jsx
function StatusBadge({ status }) {
  const styles = {
    pending: { bg: '#fff3cd', color: '#856404' },
    verified: { bg: '#d4edda', color: '#155724' },
    rejected: { bg: '#f8d7da', color: '#721c24' }
  };

  const labels = {
    pending: 'Pending Review',
    verified: 'Approved',
    rejected: 'Rejected'
  };

  return (
    <Badge style={styles[status]}>
      {labels[status]}
    </Badge>
  );
}
```

#### Pagination

```jsx
<Pagination>
  <PaginationInfo>
    Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, pagination.total)} 
    of {pagination.total} documents
  </PaginationInfo>
  
  <PaginationControls>
    <Button 
      onClick={() => setPage(prev => Math.max(1, prev - 1))}
      disabled={page === 1}
    >
      ← Previous
    </Button>
    
    <PageNumber>{page} of {pagination.pages}</PageNumber>
    
    <Button 
      onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
      disabled={page === pagination.pages}
    >
      Next →
    </Button>
  </PaginationControls>
</Pagination>
```

### API Integration

#### Fetch Documents
```javascript
const response = await fetch(
  `/api/documents/list?role=${role}&verification_status=${status}&page=${page}`,
  {
    headers: { 'x-admin-token': adminToken }
  }
);
const data = await response.json();
```

#### Submit Verification
```javascript
const response = await fetch(
  `/api/documents/verify`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken
    },
    body: JSON.stringify({
      document_id: doc.id,
      verification_status: 'verified', // or 'rejected'
      verification_notes: 'Notes here'
    })
  }
);
```

### Workflow

1. **Admin opens dashboard**
   - Sees all pending documents by default
   - Can filter by role and status
   - Pagination shows 20 documents per page

2. **Admin clicks "Review"**
   - Modal opens with full document details
   - Shows user info, specialization, credentials
   - Document preview (image/PDF)

3. **Admin reviews document**
   - Can download to inspect
   - Makes approval/rejection decision
   - Adds notes (required for rejection)

4. **Admin submits decision**
   - Document status updated
   - If all docs approved → professional marked verified
   - Professional can now offer services

5. **Professional notified** (optional email)
   - If approved: Can start consultations
   - If rejected: Instructions to resubmit

---

## Email Verification Page

**File:** `frontend/src/pages/verify-email.jsx`

**Purpose:** Email confirmation page

### Features

- ✅ Token validation
- ✅ Auto-verification on load
- ✅ Status messages
- ✅ Redirect on success
- ✅ Error handling
- ✅ Resend option

### Usage Flow

1. User signs up
2. Receives email with link: `domain.com/verify-email?token=xxx`
3. Page auto-verifies token
4. Shows success message
5. Redirects to login

### Component

```jsx
export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) return;
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setEmail(data.email);
        // Redirect after 3 seconds
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setStatus('error');
        setError(data.error);
      }
    } catch (err) {
      setStatus('error');
      setError('Verification failed. Please try again.');
    }
  };

  return (
    <Container>
      {status === 'verifying' && (
        <Message type="info">
          <Spinner />
          Verifying your email...
        </Message>
      )}

      {status === 'success' && (
        <Message type="success">
          ✓ Email verified successfully!
          <p>You can now login to your account.</p>
          <p>Redirecting in 3 seconds...</p>
        </Message>
      )}

      {status === 'error' && (
        <Message type="error">
          ✗ Verification failed
          <p>{error}</p>
          <Button onClick={handleResend}>
            Resend Verification Email
          </Button>
        </Message>
      )}
    </Container>
  );
}
```

---

## Integration Examples

### Example 1: Complete Signup Flow

```jsx
import { useState } from 'react';
import SignupForm from '@/components/SignupForm';

export default function SignupFlow() {
  const [step, setStep] = useState('signup'); // signup → verify → profile

  return (
    <>
      {step === 'signup' && (
        <SignupForm 
          onSuccess={(userId) => {
            // Redirect to email verification
            router.push('/verify-email');
          }}
        />
      )}

      {step === 'verify' && (
        <VerifyEmailPage />
      )}

      {step === 'profile' && (
        <CompleteProfilePage userId={userId} />
      )}
    </>
  );
}
```

### Example 2: Doctor Onboarding

```jsx
import DocumentUpload from '@/components/DocumentUpload';
import { useAuth } from '@/context/useAuth';

export default function DoctorOnboarding() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, Dr. {user.full_name}</h1>
      <p>Please upload your credentials for verification.</p>

      <DocumentUpload 
        userId={user.id}
        role="doctor"
        onUploadComplete={(doc) => {
          // Refresh documents list
          console.log('Document uploaded:', doc);
        }}
      />
    </div>
  );
}
```

### Example 3: Nurse Onboarding

```jsx
import DocumentUpload from '@/components/DocumentUpload';

export default function NurseOnboarding() {
  const userId = getUserId();

  return (
    <DocumentUpload 
      userId={userId}
      role="nurse"
    />
  );
}
```

### Example 4: Protected Admin Routes

```jsx
// pages/admin/document-verification.jsx
import DocumentVerificationDashboard from '@/pages/admin/document-verification';
import { withAdminAuth } from '@/hoc/withAdminAuth';

export default withAdminAuth(DocumentVerificationDashboard);

// hoc/withAdminAuth.jsx
export function withAdminAuth(Component) {
  return function AdminRoute(props) {
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
      const token = localStorage.getItem('admin_token');
      setIsAdmin(token === process.env.NEXT_PUBLIC_ADMIN_TOKEN);
    }, []);

    if (!isAdmin) return <Redirect to="/login" />;
    return <Component {...props} />;
  };
}
```

---

## Styling Guide

All components use styled-components:

```jsx
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;
```

---

## Responsive Design

All components are mobile-first and responsive:

```
Desktop (1024px+): Full layouts, sidebars
Tablet (768px-1023px): Adjusted spacing, stacked grids
Mobile (<768px): Single column, full width, touch-friendly
```

---

**Last Updated:** June 2026  
**Version:** 1.0.0
