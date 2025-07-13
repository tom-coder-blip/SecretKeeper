const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://secretkeeper-frontend.onrender.com'; // Set to your deployed frontend URL
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Authentication middleware
app.use(isAuth);

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP((req, res) => ({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: { headerEditorEnabled: true },
    context: { req, res },
  }))
);

// MongoDB connection & server start
const mongoUri = process.env.MONGO_URI;

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
