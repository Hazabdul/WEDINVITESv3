/**
 * Example Component - Using API Client
 * This shows how to integrate the API client with React components
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

export function ExampleAuthComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiClient.getMe();
        setUser(userData);
      } catch {
        // User not authenticated
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.login(email, password);
      setUser(response);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  if (user) {
    return (
      <div className="p-4 bg-green-50 rounded">
        <p>Welcome, {user.name}</p>
        <button onClick={handleLogout} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
          Logout
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="p-4 bg-gray-50 rounded max-w-md">
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

/**
 * Example Component - Invitation CRUD
 */
export function ExampleInvitationComponent() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch invitations on component mount
  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getInvitations();
      setInvitations(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      const newInvitation = await apiClient.createInvitation({
        coupleNames: 'John & Jane Doe',
        eventDate: '2024-06-15',
        location: 'New York',
        template: 'classic',
      });
      setInvitations([...invitations, newInvitation]);
    } catch (err) {
      setError(err.message || 'Failed to create invitation');
    }
  };

  const handleDeleteInvitation = async (id) => {
    try {
      await apiClient.deleteInvitation(id);
      setInvitations(invitations.filter(inv => inv._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete invitation');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      <button
        onClick={handleCreateInvitation}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Create New Invitation
      </button>

      <div className="grid gap-4">
        {invitations.map((invitation) => (
          <div key={invitation._id} className="p-4 bg-white border rounded">
            <h3 className="font-bold">{invitation.coupleNames}</h3>
            <p className="text-sm text-gray-600">{invitation.eventDate}</p>
            <p className="text-sm text-gray-600">{invitation.location}</p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => window.open(`/invitation/${invitation.slug || invitation._id}`)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
              >
                Preview
              </button>
              <button
                onClick={() => handleDeleteInvitation(invitation._id)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example Component - File Upload
 */
export function ExampleUploadComponent() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const result = await apiClient.uploadFile(file);
      setUploadedFile(result);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded max-w-md">
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="w-full"
        />
      </div>

      {uploading && <div className="text-sm text-blue-600">Uploading...</div>}

      {uploadedFile && (
        <div className="p-2 bg-green-50 rounded">
          <p className="text-sm font-medium">Upload successful!</p>
          <img src={uploadedFile.url} alt="Uploaded" className="mt-2 w-full rounded" />
        </div>
      )}
    </div>
  );
}

/**
 * Example Component - RSVP Submission (Public)
 */
export function ExampleRSVPComponent({ invitationId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.submitRSVP(invitationId, {
        name,
        email,
        attending,
      });
      setSubmitted(true);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.message || 'RSVP submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 rounded text-center">
        <p className="font-bold text-green-700">Thank you for your RSVP!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded max-w-md">
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Will you attend?</label>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name="attending"
              value="true"
              checked={attending === true}
              onChange={() => setAttending(true)}
            />
            Yes, I'll attend
          </label>
          <label>
            <input
              type="radio"
              name="attending"
              value="false"
              checked={attending === false}
              onChange={() => setAttending(false)}
            />
            Can't attend
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit RSVP'}
      </button>
    </form>
  );
}

export default ExampleAuthComponent;
