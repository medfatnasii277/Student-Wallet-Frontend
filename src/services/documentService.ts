import api from './api';

export interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  student: {
    id: number;
    name: string;
    username: string;
  };
}

export interface DocumentShare {
  id: number;
  document: Document;
  owner: {
    id: number;
    name: string;
    username: string;
  };
  recipient: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
  sharedAt: string;
  message?: string;
}

export interface DocumentSummary {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  owner: {
    id: number;
    name: string;
    username: string;
  };
  isOwner: boolean;
  isShared: boolean;
  shareMessage?: string;
  sharedAt?: string;
}

export interface ShareDocumentRequest {
  recipientEmail: string;
  message?: string;
}

export class DocumentService {
  // Share a document with another student
  static async shareDocument(documentId: number, request: ShareDocumentRequest): Promise<DocumentShare> {
    const response = await api.post(`/documents/${documentId}/share`, request);
    return response.data;
  }

  // Get all accessible documents (owned + shared)
  static async getAccessibleDocuments(): Promise<DocumentSummary[]> {
    const response = await api.get('/documents/accessible');
    return response.data;
  }

  // Get documents shared by the current user
  static async getDocumentsSharedByMe(): Promise<DocumentShare[]> {
    const response = await api.get('/documents/shared-by-me');
    return response.data;
  }

  // Get documents shared with the current user
  static async getDocumentsSharedWithMe(): Promise<DocumentShare[]> {
    const response = await api.get('/documents/shared-with-me');
    return response.data;
  }

  // Get all students who have access to a specific document
  static async getDocumentRecipients(documentId: number): Promise<any[]> {
    const response = await api.get(`/documents/${documentId}/recipients`);
    return response.data;
  }

  // Revoke access to a document for a specific student
  static async revokeAccess(documentId: number, recipientEmail: string): Promise<void> {
    await api.delete(`/documents/${documentId}/share`, {
      data: { recipientEmail }
    });
  }

  // Check if a student has access to a document
  static async hasAccessToDocument(documentId: number): Promise<boolean> {
    try {
      await api.get(`/download/${documentId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Upload a new document
  static async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Download a document
  static async downloadDocument(documentId: number, fileName: string): Promise<void> {
    const response = await api.get(`/download/${documentId}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Delete a document (only for owners)
  static async deleteDocument(documentId: number): Promise<void> {
    await api.delete(`/delete/${documentId}`);
  }

  // Get user's own documents
  static async getMyDocuments(page: number = 0, size: number = 10): Promise<{
    content: Document[];
    totalPages: number;
    totalElements: number;
  }> {
    const response = await api.get(`/my-files?page=${page}&size=${size}`);
    return response.data;
  }
} 