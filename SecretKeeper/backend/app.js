// backend/app.js (clean, Render-ready)

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
const allowedOrigins = [
  'http://localhost:3000',
  'https://secretkeeper-frontend.onrender.com' // replace with your actual Render frontend URL when deployed
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
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
    graphiql: {
      headerEditorEnabled: true,
    },
    context: { req, res },
  }))
);

// MongoDB connection & server start
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
      serverSelectionTimeoutMS: 5000,
    }
  )
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/graphql`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
