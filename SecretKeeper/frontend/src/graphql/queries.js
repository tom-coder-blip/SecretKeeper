//act as the frontend's gateway to the backend using GraphQL.

import { gql } from '@apollo/client';

// Query to fetch all secrets
export const GET_SECRETS = gql`
  query GetSecrets {
    secrets {
      _id
      content
      likes
      createdAt
      creator
    }
  }
`;

// Query to check if the user is authenticated
export const IS_AUTHENTICATED = gql`
  query IsAuthenticated {
    isAuthenticated
  }
`;