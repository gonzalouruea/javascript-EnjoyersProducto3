const { MongoClient } = require("mongodb");
const { users, cards } = require("./data/storage");

const uri = "mongodb://localhost:27017";
const dbName = "voluntariado";

async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const usersCol = db.collection("users");
    const cardsCol = db.collection("cards");
    const userCards = db.collection("usercards");

    // Limpia si ya había datos (opcional)
    await usersCol.deleteMany({});
    await cardsCol.deleteMany({});
    await userCards.deleteMany({});


    // Inserta los datos de storage.js
    const usersWithHashed = await Promise.all(users.map(async user => {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return { ...user, password: hashedPassword };
    }));

    await usersCol.insertMany(usersWithHashed);
    await cardsCol.insertMany(cards);

    console.log("Migración completada con éxito.");
  } catch (err) {
    console.error("Error migrando:", err);
  } finally {
    await client.close();
  }
}

migrate();
