import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Auth from './components/Auth';
import SecretFeed from './components/SecretFeed';
import CreateSecret from './components/CreateSecret';
import Welcome from './components/Welcome';
import { useMutation, useQuery } from '@apollo/client';
import { LOGOUT_USER } from './graphql/mutations'; // Handles user logout.
import { IS_AUTHENTICATED } from './graphql/queries'; //Checks if user is logged in (via cookie).

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
  const navigate = useNavigate(); // Use navigate to redirect after logout
  const [logout] = useMutation(LOGOUT_USER);

  const { data } = useQuery(IS_AUTHENTICATED);

  // Check if user is authenticated on initial load
  useEffect(() => {
    if (data && typeof data.isAuthenticated === 'boolean') {
      setIsLoggedIn(data.isAuthenticated);
    }
  }, [data]);

  // Handle logout
  // This function will be called when the user clicks the logout button
  // It will call the logout mutation, update the state, and redirect to the welcome page
  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      navigate('/'); // Redirect to welcome page
    } catch (err) {
      console.error(err);
      alert('Logout failed.');
    }
  };

  return (
    <div>
      <nav>
        <Link to="/">Welcome</Link> |{' '}
        <Link to="/feed">Feed</Link> |{' '}
        {isLoggedIn && <Link to="/create">Post Secret</Link>} |{' '}
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/auth">Login/Register</Link>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/feed" element={<SecretFeed />} />
        <Route
          path="/auth"
          element={<Auth setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/create" element={<CreateSecret />} />
        <Route
          path="/create"
          element={<CreateSecret isLoggedIn={isLoggedIn} />}
        />
      </Routes>
    </div>
  );
};

export default App;