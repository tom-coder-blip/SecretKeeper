import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'; // Connectsmy React app to the GraphQL backend.
import { BrowserRouter } from 'react-router-dom'; //Enables routing (switching pages/views without refreshing the app).
import './styles.css'; // import the dark theme

const client = new ApolloClient({
  uri: 'https://secretkeeper-backend.onrender.com/graphql', // The URL of my GraphQL server.
  cache: new InMemoryCache(), 
  credentials: 'include', //Ensures that my cookie are sent with requests!
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
);


  
