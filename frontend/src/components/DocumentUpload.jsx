import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  padding:2rem;
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-top: 0;
  color: #333;
`;

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DocumentCard = styled.div`
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    background-color: #f8f9fa;
  }

  &.uploaded {
    border-color: #28a745;
    background-color: #f1f9f5;
  }

  &.rejected {
    border-color: #dc3545;
    background-color: #fff5f5;
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .name {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
    color: #333;
  }

  .status {
    font-size: 0.75rem;
    color: #666;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    background-color: #f0f7ff;
  }

  &.dragover {
    border-color: #007bff;
    background-color: #e7f3ff;
  }

  .upload-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .upload-text {
    color: #333;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }

  .upload-hint {
    color: #999;
    font-size: 0.85rem;
  }
`;

const HiddenInput = styled.input`
  display: none;
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

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;

  .progress {
    height: 100%;
    background-color: #007bff;
    width: ${(props) => props.progress}%;
    transition: width 0.3s;
  }
`;

const documentTypesConfig = {
  doctor: [
    { id: 'government_id', label: 'Government ID', icon: '🪪' },
    { id: 'annual_license', label: 'Annual License', icon: '📋' },
    { id: 'medical_degree', label: 'Medical Degree', icon: '🎓' },
    { id: 'registration_certificate', label: 'Registration Certificate', icon: '📜' },
  ],
  nurse: [
    { id: 'government_id', label: 'Government ID', icon: '🪪' },
    { id: 'annual_license', label: 'Annual License', icon: '📋' },
    { id: 'nursing_degree', label: 'Nursing Degree', icon: '🎓' },
  ],
};

export default function DocumentUpload({ userId, role }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [message, setMessage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const documents = documentTypesConfig[role] || [];
  const fileInputRef = { current: {} };

  const handleFileSelect = async (e, documentType) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDocument(file, documentType);
    }
  };

  const uploadDocument = async (file, documentType) => {
    // Validate file
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'File too large. Maximum size is 10MB',
      });
      return;
    }

    setUploading(true);
    setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      formData.append('role', role);
      formData.append('document_type', documentType);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress((prev) => ({
            ...prev,
            [documentType]: percentComplete,
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadStatus((prev) => ({
            ...prev,
            [documentType]: 'uploaded',
          }));
          setMessage({
            type: 'success',
            text: `${documentType} uploaded successfully!`,
          });
          setSelectedType(null);
        } else {
          const response = JSON.parse(xhr.responseText);
          setUploadStatus((prev) => ({
            ...prev,
            [documentType]: 'error',
          }));
          setMessage({
            type: 'error',
            text: response.error || 'Upload failed',
          });
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setUploadStatus((prev) => ({
          ...prev,
          [documentType]: 'error',
        }));
        setMessage({
          type: 'error',
          text: 'Upload error. Please try again.',
        });
        setUploading(false);
      });

      xhr.open('POST', '/api/documents/upload');
      xhr.send(formData);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Upload failed. Please try again.',
      });
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e, documentType) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadDocument(file, documentType);
    }
  };

  return (
    <Container>
      <Card>
        <Title>📄 Upload Documents</Title>

        {message && (
          <Message type={message.type}>{message.text}</Message>
        )}

        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Upload the required documents for account verification. All documents
          will be reviewed by our admin team.
        </p>

        <DocumentGrid>
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              className={uploadStatus[doc.id]}
              onClick={() =>
                !uploading && fileInputRef.current[doc.id]?.click()
              }
            >
              <div className="icon">{doc.icon}</div>
              <div className="name">{doc.label}</div>
              <div className="status">
                {uploadStatus[doc.id] === 'uploaded' ? (
                  <span style={{ color: '#28a745' }}>✓ Uploaded</span>
                ) : uploadStatus[doc.id] === 'error' ? (
                  <span style={{ color: '#dc3545' }}>✗ Failed</span>
                ) : (
                  <span>Click to upload</span>
                )}
              </div>
              {uploadProgress[doc.id] > 0 && uploadProgress[doc.id] < 100 && (
                <ProgressBar progress={uploadProgress[doc.id]}>
                  <div className="progress" />
                </ProgressBar>
              )}
              <HiddenInput
                ref={(el) => (fileInputRef.current[doc.id] = el)}
                type="file"
                onChange={(e) => handleFileSelect(e, doc.id)}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </DocumentCard>
          ))}
        </DocumentGrid>

        <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1.5rem' }}>
          <strong>Accepted formats:</strong> PDF, DOC, DOCX, JPG, PNG
          <br />
          <strong>Maximum file size:</strong> 10MB per document
          <br />
          <strong>Processing time:</strong> Usually reviewed within 24-48 hours
        </p>
      </Card>
    </Container>
  );
}
