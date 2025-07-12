import { gql } from '@apollo/client';

// GraphQL mutations for user registration, login, secret creation, liking, editing, and deletion
export const REGISTER_USER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      userId
      token
      tokenExpiration
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      userId
      token
      tokenExpiration
    }
  }
`;

export const CREATE_SECRET = gql`
  mutation CreateSecret($content: String!) {
    createSecret(content: $content) {
      _id
      content
      likes
      createdAt
    }
  }
`;

export const LIKE_SECRET = gql`
  mutation LikeSecret($secretId: ID!) {
    likeSecret(secretId: $secretId) {
      _id
      content
      likes
      createdAt
    }
  }
`;

export const EDIT_SECRET = gql`
  mutation EditSecret($secretId: ID!, $content: String!) {
    editSecret(secretId: $secretId, content: $content) {
      _id
      content
      likes
      createdAt
    }
  }
`;

export const DELETE_SECRET = gql`
  mutation DeleteSecret($secretId: ID!) {
    deleteSecret(secretId: $secretId)
  }
`;

export const LOGOUT_USER = gql`
  mutation {
    logout
  }
`;