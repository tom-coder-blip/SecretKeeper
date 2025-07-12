import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_SECRET } from '../graphql/mutations';
import { IS_AUTHENTICATED } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';
import gql from 'graphql-tag';

const CreateSecret = () => {
  const [content, setContent] = useState(''); // State to hold the secret content
  // Mutation to create a new secret
  const [createSecret, { loading }] = useMutation(CREATE_SECRET, {
    update(cache, { data: { createSecret } }) {
      cache.modify({
        fields: {
          secrets(existingSecrets = []) {
            const newSecretRef = cache.writeFragment({
              data: createSecret,
              fragment: gql`
                fragment NewSecret on Secret {
                  _id
                  content
                  likes
                  createdAt
                  creator
                }
              `,
            });
            return [newSecretRef, ...existingSecrets];
          },
        },
      });
    },
    refetchQueries: ['GetSecrets'],
  });
  const { data, loading: authLoading } = useQuery(IS_AUTHENTICATED);
  const navigate = useNavigate();

  //Checks if the user is authenticated.
  // If not, immediately redirects them to the login/register page.
  useEffect(() => {
    if (!authLoading && data && data.isAuthenticated === false) {
      navigate('/auth');
    }
  }, [authLoading, data, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSecret({ variables: { content } });
      setContent('');
      navigate('/feed');
    } catch (err) {
      console.error(err);
      alert('Failed to post secret. Please ensure you are logged in.');
    }
  };

  if (authLoading) return <p>Checking authentication...</p>;

  return (
    <div>
      <h2>Post a Secret</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Your secret..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Secret'}
        </button>
      </form>
    </div>
  );
};

export default CreateSecret;