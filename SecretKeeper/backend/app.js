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

// CORS Configuration (Frontend-Backend Communication)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // React frontend URL
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // allow cookies
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
    context: { req, res }, // Pass both req and res
  }))
);

// MongoDB connection & server start
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.b3yckd0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    }
  )
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}/graphql`);
    });
  })
  .catch((err) => {
    console.error(err);
  });