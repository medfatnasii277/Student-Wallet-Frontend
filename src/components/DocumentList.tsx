import React, { useState, useEffect } from 'react';
import { DocumentService } from '../services/documentService';
import { DocumentSummary } from '../services/documentService';
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
          // Normalize items: ensure `document` property exists
          setSharedDocuments(sharedWithMe.map((s: any) => {
            if (!s.document && (s.file || s.doc)) {
              console.warn('Normalizing shared entry, found file/doc field instead of document', s);
              return { ...s, document: s.file || s.doc };
            }
            if (!s.document) {
              console.warn('Shared entry missing document', s);
            }
            return s;
          }));
          break;
        case 'shared-by-me':
          const sharedByMe = await DocumentService.getDocumentsSharedByMe();
          setSharedDocuments(sharedByMe.map((s: any) => {
            if (!s.document && (s.file || s.doc)) {
              console.warn('Normalizing shared-by-me entry, found file/doc field instead of document', s);
              return { ...s, document: s.file || s.doc };
            }
            if (!s.document) {
              console.warn('Shared-by-me entry missing document', s);
            }
            return s;
          }));
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

  const renderSharedDocumentCard = (share: any, isSharedWithMe: boolean, index: number) => {
    // Defensive guards: some shares may not include a `document` object
    const doc = share && (share.document || share.file || share.doc) || null;

    if (!doc) {
      console.warn('Shared entry is missing a document:', share);

      return (
        <div key={share?.id || `share-missing-${index}`} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            (Missing document)
          </h5>

          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
            <div>⚠️ This shared record doesn't contain the referenced document data.</div>
            <div style={{ marginTop: '8px' }}>Shared entry id: {share?.id ?? 'unknown'}</div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                // Try to reload the list if a missing document appears due to stale data
                loadDocuments();
              }}
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
              🔁 Refresh
            </button>
          </div>
        </div>
      );
    }

    // Safe property access below
    const docId = doc.id;
    const docName = doc.name || '(untitled)';
    const docType = doc.type || 'Unknown type';
    const uploadDate = doc.uploadDate || doc.uploadAt || new Date().toISOString();

    const ownerName = isSharedWithMe ? share.owner?.name ?? '(unknown)' : share.recipient?.name ?? '(unknown)';

    return (
      <div key={share?.id || `share-${index}`} style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h5 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
          {docName}
        </h5>

        <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
          <div>📄 {docType}</div>
          <div>📅 {formatDate(uploadDate)}</div>
          <div>👤 {ownerName}</div>
          <div>🕒 Shared: {formatDate(share.sharedAt || share.sharedDate || new Date().toISOString())}</div>
          {share.message && (
            <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
              💬 {share.message}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleDownload(docId, docName)}
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
              onClick={() => handleRevokeAccess(docId, share.recipient?.email || '')}
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
  };

  return (
    <div>
      {/* Header with Upload and Share Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <h3>Documents</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label htmlFor="upload-file" style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(33,150,243,0.08)'
          }}>
            📁 Upload File
            <input
              id="upload-file"
              type="file"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    await DocumentService.uploadDocument(file);
                    alert('File uploaded successfully!');
                    loadDocuments();
                  } catch (err) {
                    alert('File upload failed.');
                  }
                  e.target.value = '';
                }
              }}
            />
          </label>
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
              sharedDocuments.map((share, idx) => renderSharedDocumentCard(share, activeTab === 'shared', idx))
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