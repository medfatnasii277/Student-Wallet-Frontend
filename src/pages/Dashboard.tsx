import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch user files from the backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get('/my-files');
        setFiles(response.data);
      } catch (err) {
        console.error('Error fetching files', err);
      }
    };

    fetchFiles();
  }, []);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File uploaded successfully!');
      window.location.reload(); // Reload page to refresh file list
    } catch (err) {
      console.error('Error uploading file', err);
      alert('File upload failed.');
    }
  };

  // Handle file download
  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await api.get(`/download/${fileId}`, { responseType: 'blob' });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file', err);
      alert('File download failed.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT
    window.location.href = '/login'; // Redirect to login
  };

  return (
    <div className="container mt-4">
      {/* Header with Logout Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {/* File Upload Section */}
      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} />
        <button className="btn btn-primary mt-2" onClick={handleUpload}>Upload File</button>
      </div>

      {/* File List Section */}
      <h3>Your Files:</h3>
      {files.length > 0 ? (
        <ul className="list-group">
          {files.map((file: any) => (
            <li key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
              {file.name}
              <button className="btn btn-success btn-sm" onClick={() => handleDownload(file.id, file.name)}>Download</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  );
};

export default Dashboard;
