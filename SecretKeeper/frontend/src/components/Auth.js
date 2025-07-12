import React, { useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { REGISTER_USER, LOGIN_USER } from '../graphql/mutations';

const Auth = ({ setIsLoggedIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const client = useApolloClient(); // Apollo Client instance to refetch queries

  const [register] = useMutation(REGISTER_USER); // Mutation for user registration
  const [login] = useMutation(LOGIN_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ variables: { email, password } });
      } else {
        await register({ variables: { email, password } });
      }
      setEmail('');
      setPassword('');
      setIsLoggedIn(true); // Mark as logged in
      await client.refetchQueries({ include: ['IsAuthenticated'] }); // Refetch queries to update the state
      navigate('/feed'); // Redirect to feed
    } catch (error) {
      console.error(error);
      alert('Authentication failed.');
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
    </div>
  );
};

export default Auth;