const express = require('express');
//const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const root = require('./graphql/resolvers');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');
const { verifyToken } = require("./auth.js");

const port = 4000;
const route = "graphql";

const app = express();
//app.use(cors());
app.use(express.json());

app.use('/'+route, graphqlHTTP((req) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userData = token ? verifyToken(token) : null;

  return {
    schema,
    rootValue: root,
    context: { user: userData },
    graphiql: true
  };
}));

app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);

app.listen(port, () => console.log('Servidor en http://localhost:'+port+'/'+route));
