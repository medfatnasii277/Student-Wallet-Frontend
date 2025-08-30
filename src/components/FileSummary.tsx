import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Form, Spinner, Alert } from 'react-bootstrap';
// ...existing code...

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ...existing code...

async function summarizeText(text: string): Promise<string> {
  const prompt = `Summarize the following file in a clear, consistent way with a title and sections.\n\n${text}`;
  const body = {
    contents: [
      { parts: [ { text: prompt } ] }
    ]
  };
  const response = await fetch(GEMINI_API_URL + '?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error('Gemini API error');
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary returned.';
}

const FileSummary: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setSummary('');
    setError('');
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      let text = await readFileAsText(file);
      const result = await summarizeText(text);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'Error summarizing file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        style={{
          background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
          padding: '24px 24px 16px 24px',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          marginBottom: 24,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={{ fontSize: 36, marginBottom: 6 }}>📄</div>
        <h2 style={{ fontWeight: 700, fontSize: '1.6rem', margin: 0 }}>File Summary</h2>
        <div style={{ fontSize: '1rem', opacity: 0.85, marginTop: 6 }}>
          Upload a TXT file and get a clear, concise summary.
        </div>
      </motion.div>
      <div>
        <Form.Group controlId="formFile" className="mb-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Form.Label style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 12 }}></Form.Label>
          <motion.label 
            htmlFor="file-upload" 
            style={{
              display: 'inline-block',
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.08rem',
              padding: '12px 32px',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginBottom: 8,
              border: 'none',
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(33,150,243,0.20)' }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ marginRight: 8, fontSize: 18 }}>📤</span> Choose File
            <Form.Control id="file-upload" type="file" accept=".txt" onChange={handleFileChange} style={{ display: 'none' }} />
          </motion.label>
          {file && <span style={{ marginTop: 6, color: '#1976d2', fontWeight: 500 }}>{file.name}</span>}
        </Form.Group>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <motion.button 
            disabled={!file || loading} 
            onClick={handleSummarize} 
            style={{ 
              minWidth: 120, 
              fontWeight: 600, 
              fontSize: '1rem', 
              borderRadius: 8,
              padding: '8px 16px',
              backgroundColor: (!file || loading) ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              cursor: (!file || loading) ? 'not-allowed' : 'pointer'
            }}
            whileHover={!file || loading ? {} : { scale: 1.05 }}
            whileTap={!file || loading ? {} : { scale: 0.95 }}
          >
            {loading ? <Spinner size="sm" animation="border" /> : 'Summarize'}
          </motion.button>
        </div>
        {error && <Alert variant="danger" className="mt-2 mb-3">{error}</Alert>}
        {summary && (
          <div className="mt-4">
            <h4 style={{ fontWeight: 600, color: '#1976d2', marginBottom: 12 }}>Summary</h4>
            <div
              style={{
                background: '#f5f8ff',
                padding: 18,
                borderRadius: 10,
                maxHeight: 320,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: '1.08rem',
                border: '1px solid #e0e0e0',
                marginBottom: 16,
                color: '#222',
                boxShadow: '0 2px 8px rgba(33,150,243,0.07)',
              }}
            >
              {summary}
            </div>
            {summary.length > 3000 || summary.endsWith('...') ? (
              <Alert variant="warning" className="mb-3">
                The summary may be truncated. For large files, try splitting the file or prompt Gemini for a more concise summary.
              </Alert>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button 
                onClick={handleDownload} 
                style={{ 
                  fontWeight: 600, 
                  borderRadius: 8,
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download Summary
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FileSummary;
