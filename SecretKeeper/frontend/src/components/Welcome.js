import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>🤐 Welcome to Simple Secret Keeper</h1>
      <p>Post secrets anonymously, view others, and like them.</p>
      <Link to="/feed">
        <button>Go to Feed</button>
      </Link>
    </div>
  );
};

export default Welcome;