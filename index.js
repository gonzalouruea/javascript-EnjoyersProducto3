const express = require('express');

const { createHandler } = require('graphql-http/lib/use/express');

const schema = require('./graphql/schema.js');
const root = require('./graphql/resolvers.js');
const userRoutes = require('./routes/userRoutes.js');
const cardRoutes = require('./routes/cardRoutes.js');
const { verifyToken , getUserFromToken} = require("./auth.js");

const port = 4000;
const route = "graphql";

const app = express();

app.get('/', (req, res) => res.send('Bienvenido a mi API GraphQL'));

app.use(express.json());

app.use('/' + route, createHandler({
  schema,
  rootValue: root,
  context: async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const userData = token ? verifyToken(token) : null;
    const currentUser = getUserFromToken(token);
    return { user: userData, currentUser };
  }
}));

app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);

app.listen(port, () => console.log('Servidor en http://localhost:'+port+'/'+route));
