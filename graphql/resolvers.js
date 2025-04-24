const { users, cards } = require('../data/storage');
const { generateToken } = require("../auth.js");
const bcrypt = require("bcryptjs");

const resolvers = {
  users: () => users,
  cards: () => cards,
  userByEmail: ({ email }) => users.find(u => u.email === email),
  cardsByEmail: ({ email }) => cards.filter(c => c.email === email),
  cardsByType: ({ volunType }) => cards.filter(c => c.volunType === volunType),

  createUser: async ({ input }) => {
    if (users.find(u => u.email === input.email)) throw new Error("Usuario ya existe");
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const newUser = {
        name: input.name,
        email: input. email,
        password: hashedPassword
    }
    users.push(newUser);
    return newUser;
  },
  updateUser: ({ email, input }) => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("Usuario no encontrado");
    Object.assign(user, input);
    return user;
  },
  deleteUser: ({ email }) => {
    const index = users.findIndex(u => u.email === email);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },

  createCard: ({ input }) => {
    cards.push(input);
    return input;
  },
  updateCard: ({ email, title, input }) => {
    const card = cards.find(c => c.email === email && c.title === title);
    if (!card) throw new Error("Card no encontrada");
    Object.assign(card, input);
    return card;
  },
  deleteCard: ({ email, title }) => {
    const index = cards.findIndex(c => c.email === email && c.title === title);
    if (index === -1) return false;
    cards.splice(index, 1);
    return true;
  },
  login: async ({ email, password }) => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("Usuario no encontrado");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Contraseña incorrecta");

    return generateToken(user);
  },
};

module.exports = resolvers;
