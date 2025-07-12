import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SECRETS } from '../graphql/queries';
import { LIKE_SECRET, EDIT_SECRET, DELETE_SECRET } from '../graphql/mutations';
import { useQuery as useAuthQuery } from '@apollo/client';
import { IS_AUTHENTICATED } from '../graphql/queries';

const SecretFeed = () => {
  const { loading, error, data, refetch } = useQuery(GET_SECRETS); // Fetch all secrets
  const [likeSecret] = useMutation(LIKE_SECRET);
  const [editSecret] = useMutation(EDIT_SECRET);
  const [deleteSecret] = useMutation(DELETE_SECRET);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const { data: authData } = useAuthQuery(IS_AUTHENTICATED);
  const userId = authData?.isAuthenticated ? getUserIdFromCookie() : null; // Get userId from cookie if authenticated

  function getUserIdFromCookie() {
    // This function should extract the userId from your JWT cookie if available.
    // For a real app, you would decode the JWT on the backend and expose userId in a query.
    // Here, you may want to add a query like `me { _id }` for a robust solution.
    return null; // Placeholder
  }

  if (loading) return <p>Loading secrets...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleLike = async (id) => {
    try {
      await likeSecret({ variables: { secretId: id } });
      refetch();
    } catch (err) {
      if (err.message.includes('Not authenticated')) {
        alert('You must be logged in to like secrets!');
      } else {
        alert('An error occurred while liking the secret.');
      }
    }
  };

  const handleEdit = (secret) => {
    setEditingId(secret._id);
    setEditContent(secret.content);
  };

  const handleEditSubmit = async (id) => {
    try {
      await editSecret({ variables: { secretId: id, content: editContent } });
      setEditingId(null);
      setEditContent('');
      refetch();
    } catch (err) {
      alert('Failed to edit secret. Make sure you are logged in and the creator.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this secret?')) return;
    try {
      await deleteSecret({ variables: { secretId: id } });
      refetch();
    } catch (err) {
      alert('Failed to delete secret. Make sure you are logged in and the creator.');
    }
  };

  return (
    <div>
      <h2>Public Secret Feed</h2>
      {data.secrets.map((secret) => (
        <div key={secret._id} className="card">
          {editingId === secret._id ? (
            <>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={3}
                style={{ width: '100%' }}
              />
              <button onClick={() => handleEditSubmit(secret._id)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <p>{secret.content}</p>
              <p>Likes: {secret.likes}</p>
              <button onClick={() => handleLike(secret._id)}>Like</button>
              <button onClick={() => handleEdit(secret)}>Edit</button>
              <button onClick={() => handleDelete(secret._id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SecretFeed;