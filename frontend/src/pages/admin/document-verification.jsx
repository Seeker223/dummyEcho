import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  p {
    color: #666;
    margin: 0;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;

  th {
    background-color: #f5f5f5;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #ddd;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  tr:hover {
    background-color: #f9f9f9;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;

  ${(props) => {
    switch (props.status) {
      case 'verified':
        return 'background-color: #d4edda; color: #155724;';
      case 'rejected':
        return 'background-color: #f8d7da; color: #721c24;';
      case 'pending':
        return 'background-color: #cfe2ff; color: #084298;';
      default:
        return 'background-color: #e2e3e5; color: #383d41;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;

  ${(props) =>
    props.variant === 'approve'
      ? `
    background-color: #28a745;
    color: white;
    &:hover { background-color: #218838; }
  `
      : `
    background-color: #dc3545;
    color: white;
    &:hover { background-color: #c82333; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const DocumentInfo = styled.div`
  margin-bottom: 1.5rem;

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;

    label {
      font-weight: 600;
      color: #333;
    }

    value {
      color: #666;
    }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  margin-bottom: 1rem;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  float: right;

  &:hover {
    color: #333;
  }
`;

export default function DocumentVerificationDashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    verification_status: 'pending',
    page: 1,
  });
  const [pagination, setPagination] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        role: filters.role || '',
        verification_status: filters.verification_status || '',
        page: filters.page,
        limit: 20,
      });

      const response = await fetch(`/api/documents/list?${queryParams}`, {
        headers: {
          'x-admin-token': adminToken,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents);
        setPagination(data.pagination);
      } else {
        console.error('Error fetching documents:', data.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (document_id, status) => {
    if (status === 'rejected' && !verificationNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/documents/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          document_id,
          verification_status: status,
          verification_notes: verificationNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Document ${status} successfully`);
        setSelectedDoc(null);
        setVerificationNotes('');
        fetchDocuments();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify document');
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container>
      <Header>
        <h1>📄 Document Verification Dashboard</h1>
        <p>Review and verify doctor and nurse credentials</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/mdcn/doctors" target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚕️ MDCN Doctor Verification Portal</span>
            <span>↗</span>
          </a>
          <a href="/mdcn/nurses" target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1rem', background: '#0f766e', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏥 NMCN Nurse Verification Portal</span>
            <span>↗</span>
          </a>
        </div>
      </Header>

      <FilterBar>
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
        >
          <option value="">All Roles</option>
          <option value="doctor">Doctors</option>
          <option value="nurse">Nurses</option>
        </select>

        <select
          value={filters.verification_status}
          onChange={(e) =>
            setFilters({ ...filters, verification_status: e.target.value, page: 1 })
          }
        >
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterBar>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p>No documents found</p>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Document Type</th>
                <th>File</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.profiles?.full_name || 'N/A'}</strong>
                    <br />
                    <small>{doc.profiles?.email}</small>
                  </td>
                  <td>
                    {doc.role === 'doctor' ? '👨‍⚕️' : '👩‍⚕️'} {doc.role}
                  </td>
                  <td>{doc.document_type}</td>
                  <td>
                    {doc.file_name}
                    <br />
                    <small>{formatFileSize(doc.file_size)}</small>
                  </td>
                  <td>{formatDate(doc.created_at)}</td>
                  <td>
                    <StatusBadge status={doc.verification_status}>
                      {doc.verification_status}
                    </StatusBadge>
                  </td>
                  <td>
                    <ActionButtons>
                      <Button
                        style={{ backgroundColor: '#3b82f6', color: 'white' }}
                        onClick={() => setSelectedDoc(doc)}
                      >
                        Inspect Details
                      </Button>
                    </ActionButtons>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {pagination.pages > 1 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <span style={{ margin: '0 1rem' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                disabled={filters.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {selectedDoc && (
        <Modal onClick={() => setSelectedDoc(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedDoc(null)}>×</CloseButton>
            <h2>Document Review</h2>

            <DocumentInfo>
              <div className="info-row">
                <label>Name:</label>
                <value>{selectedDoc.profiles?.full_name}</value>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <value>{selectedDoc.profiles?.email}</value>
              </div>
              <div className="info-row">
                <label>Role:</label>
                <value>{selectedDoc.role}</value>
              </div>
              {selectedDoc.role === 'doctor' && (
                <>
                  <div className="info-row">
                    <label>License:</label>
                    <value>{selectedDoc.doctors?.license_number}</value>
                  </div>
                  <div className="info-row">
                    <label>Specialization:</label>
                    <value>{selectedDoc.doctors?.specialization}</value>
                  </div>
                </>
              )}
              {selectedDoc.role === 'nurse' && (
                <>
                  <div className="info-row">
                    <label>License:</label>
                    <value>{selectedDoc.nurses?.license_number}</value>
                  </div>
                  <div className="info-row">
                    <label>Certification:</label>
                    <value>{selectedDoc.nurses?.certification}</value>
                  </div>
                </>
              )}
              <div className="info-row">
                <label>Document Type:</label>
                <value>{selectedDoc.document_type}</value>
              </div>
              <div className="info-row">
                <label>File:</label>
                <value>
                  {selectedDoc.file_name} ({formatFileSize(selectedDoc.file_size)})
                </value>
              </div>
            </DocumentInfo>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: '#93c5fd' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>🔒 Council Verification Authority Only</p>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                Direct system admin verification is disabled for statutory compliance. To verify or reject clinician licenses, please use the official council portals.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a href="/mdcn/doctors" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button style={{ background: '#3b82f6', color: 'white', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    Open MDCN Doctor Portal ↗
                  </Button>
                </a>
                <a href="/mdcn/nurses" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button style={{ background: '#0d9488', color: 'white', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                    Open NMCN Nurse Portal ↗
                  </Button>
                </a>
              </div>
            </div>

            <ModalButtons style={{ marginTop: '1rem' }}>
              <Button
                onClick={() => setSelectedDoc(null)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  width: '100%',
                }}
              >
                Close Details
              </Button>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
