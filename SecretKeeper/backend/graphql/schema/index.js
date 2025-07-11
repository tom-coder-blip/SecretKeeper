const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Secret {
    _id: ID!
    content: String!
    likes: Int!
    createdAt: String!
    creator: ID
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
  }

  type User {
    _id: ID!
    email: String!
    likedSecrets: [Secret!]
  }

  type RootQuery {
    secrets: [Secret!]!
    isAuthenticated: Boolean!
  }

  type RootMutation {
    register(email: String!, password: String!): AuthData!
    login(email: String!, password: String!): AuthData!
    createSecret(content: String!): Secret!
    likeSecret(secretId: ID!): Secret!
    editSecret(secretId: ID!, content: String!): Secret!
    deleteSecret(secretId: ID!): Boolean!
    logout: Boolean!       
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
