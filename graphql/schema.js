const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    _id: ID
    name: String
    email: String
    password: String
    
  }

  type Card {
    _id: ID
    date: String
    title: String
    description: String
    autor: String
    volunType: String
    email: String
    
  }

  type UserCards {
  email: String!
  selectedCards: [Card]!
  }


  input UserInput {
    name: String
    email: String
    password: String
  }
  input UserCreate {
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
    input CardCreate {
    date: String!
    title: String!
    description: String!
    autor: String!
    volunType: String!
    email: String!
  }

  # con este type se hace que muestre el mensaje al hacer el deleteUser y deleteCard

  type DeleteResponse {
    success: Boolean
    message: String
  }
  

  type Query {
    users: [User]
    cards: [Card]
    userByEmail(email: String!): User
    cardsByEmail(email: String!): [Card]
    cardsByType(volunType: String!): [Card]
    currentUser: User
    getUserCards(email: String!): UserCards
  }

  type Mutation {
    login(email: String!, password: String!): String
    createUser(input: UserCreate!): User
    updateUser(email: String!, input: UserInput!): User
    deleteUser(email: String!): DeleteResponse

    createCard(input: CardCreate!): Card
    updateCard(cardId: String!, input: CardInput!): String
    deleteCard(cardId: String!): DeleteResponse
    addUserCard(email: String!, cardId: String!): UserCards
    deleteUserCard(email: String!, cardId: String!): UserCards

  }
`);

module.exports = schema;
