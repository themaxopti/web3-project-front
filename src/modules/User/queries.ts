import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation Mutations($user: UserInput!) {
    createUser(user: $user) {
      userName
      email
      wallet
      id
    }
  }
`;

export const GET_USER_BY_WALLET = gql`
  query GetUserByWallet($wallet: String!) {
    getUserByWallet(wallet: $wallet) {
      userName
      email
      wallet
      id
    }
  }
`;

export const GET_NONCE = gql`
  query CreateNonce($address: String!) {
    nonce(address: $address) {
      tempToken
      message
    }
  }
`;

export const VERIFY_ACCOUNT = gql`
  query VerifyAccount($signature: String!) {
    verify(signature: $signature)
  }
`;
