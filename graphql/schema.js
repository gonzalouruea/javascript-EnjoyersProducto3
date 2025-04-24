const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    name: String
    email: String
    password: String
  }

  type Card {
    date: String
    title: String
    description: String
    autor: String
    volunType: String
    email: String
  }

  input UserInput {
    name: String
    email: String
    password: String
  }

  input CardInput {
    date: String
    title: String
    description: String
    autor: String
    volunType: String
    email: String
  }

  type Query {
    users: [User]
    cards: [Card]
    userByEmail(email: String!): User
    cardsByEmail(email: String!): [Card]
    cardsByType(volunType: String!): [Card]
  }

  type Mutation {
    login(email: String!, password: String!): String
    createUser(input: UserInput): User
    updateUser(email: String!, input: UserInput): User
    deleteUser(email: String!): Boolean

    createCard(input: CardInput): Card
    updateCard(email: String!, title: String!, input: CardInput): Card
    deleteCard(email: String!, title: String!): Boolean
  }
`);

module.exports = schema;
