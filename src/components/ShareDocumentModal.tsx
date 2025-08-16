import React, { useState, useEffect } from 'react';
import { Document, DocumentService, ShareDocumentRequest } from '../services/documentService';

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<number | ''>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    try {
      const response = await DocumentService.getMyDocuments(0, 100);
      setDocuments(response.content);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocument || !recipientEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const request: ShareDocumentRequest = {
        recipientEmail,
        message: message.trim() || undefined
      };

      await DocumentService.shareDocument(selectedDocument as number, request);
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error sharing document:', error);
      setError(error.response?.data?.message || 'Failed to share document');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDocument('');
    setRecipientEmail('');
    setMessage('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0 }}>Share Document</h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="documentSelect" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Select Document *
            </label>
            <select
              id="documentSelect"
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value === '' ? '' : Number(e.target.value))}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Choose a document to share...</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="recipientEmail" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Recipient Email *
            </label>
            <input
              type="email"
              id="recipientEmail"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              placeholder="Enter recipient's email address"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="message" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              maxLength={500}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Maximum 500 characters ({message.length}/500)
            </small>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isLoading ? 'Sharing...' : 'Share Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareDocumentModal; 