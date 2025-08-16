import React, { useState, useEffect } from 'react';
import { Document, DocumentSummary, DocumentService } from '../services/documentService';
import ShareDocumentModal from './ShareDocumentModal';

interface DocumentListProps {
  onRefresh?: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'shared' | 'shared-by-me'>('all');
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [activeTab]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError('');

    try {
      switch (activeTab) {
        case 'all':
          const accessibleDocs = await DocumentService.getAccessibleDocuments();
          setDocuments(accessibleDocs);
          break;
        case 'owned':
          const myDocs = await DocumentService.getMyDocuments(0, 100);
          setDocuments(myDocs.content.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            uploadDate: doc.uploadDate,
            owner: doc.student,
            isOwner: true,
            isShared: false
          })));
          break;
        case 'shared':
          const sharedWithMe = await DocumentService.getDocumentsSharedWithMe();
          setSharedDocuments(sharedWithMe);
          break;
        case 'shared-by-me':
          const sharedByMe = await DocumentService.getDocumentsSharedByMe();
          setSharedDocuments(sharedByMe);
          break;
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      await DocumentService.downloadDocument(documentId, fileName);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (documentId: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await DocumentService.deleteDocument(documentId);
        loadDocuments();
        onRefresh?.();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      }
    }
  };

  const handleRevokeAccess = async (documentId: number, recipientEmail: string) => {
    if (window.confirm('Are you sure you want to revoke access for this user?')) {
      try {
        await DocumentService.revokeAccess(documentId, recipientEmail);
        loadDocuments();
        onRefresh?.();
      } catch (error) {
        console.error('Error revoking access:', error);
        alert('Failed to revoke access');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderDocumentCard = (doc: DocumentSummary) => (
    <div key={doc.id} style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <h5 style={{ margin: 0, fontSize: '16px' }}>{doc.name}</h5>
        <div style={{ display: 'flex', gap: '8px' }}>
          {doc.isOwner && (
            <span style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Owned
            </span>
          )}
          {doc.isShared && (
            <span style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Shared
            </span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
        <div>📄 {doc.type || 'Unknown type'}</div>
        <div>📅 {formatDate(doc.uploadDate)}</div>
        {doc.owner && <div>👤 {doc.owner.name}</div>}
        {doc.shareMessage && (
          <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
            💬 {doc.shareMessage}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleDownload(doc.id, doc.name)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📥 Download
        </button>
        {doc.isOwner && (
          <button
            onClick={() => handleDelete(doc.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );

  const renderSharedDocumentCard = (share: any, isSharedWithMe: boolean) => (
    <div key={share.id} style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h5 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
        {share.document.name}
      </h5>

      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
        <div>📄 {share.document.type || 'Unknown type'}</div>
        <div>📅 {formatDate(share.document.uploadDate)}</div>
        <div>👤 {isSharedWithMe ? share.owner.name : share.recipient.name}</div>
        <div>🕒 Shared: {formatDate(share.sharedAt)}</div>
        {share.message && (
          <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
            💬 {share.message}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleDownload(share.document.id, share.document.name)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📥 Download
        </button>
        {!isSharedWithMe && (
          <button
            onClick={() => handleRevokeAccess(share.document.id, share.recipient.email)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🚫 Revoke Access
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header with Share Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>Documents</h3>
        <button
          onClick={() => setIsShareModalOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📤 Share Document
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        {[
          { key: 'all', label: '📁 All Documents' },
          { key: 'owned', label: '👤 My Documents' },
          { key: 'shared', label: '📥 Shared With Me' },
          { key: 'shared-by-me', label: '📤 Shared By Me' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              borderBottom: activeTab === tab.key ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === tab.key ? '#007bff' : '#666'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
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

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading documents...</div>
        </div>
      )}

      {/* Document List */}
      {!isLoading && (
        <div>
          {activeTab === 'all' || activeTab === 'owned' ? (
            documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No documents found
              </div>
            ) : (
              documents.map(renderDocumentCard)
            )
          ) : (
            sharedDocuments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No shared documents found
              </div>
            ) : (
              sharedDocuments.map(share => 
                renderSharedDocumentCard(share, activeTab === 'shared')
              )
            )
          )}
        </div>
      )}

      {/* Share Document Modal */}
      <ShareDocumentModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSuccess={() => {
          loadDocuments();
          onRefresh?.();
        }}
      />
    </div>
  );
};

export default DocumentList; 