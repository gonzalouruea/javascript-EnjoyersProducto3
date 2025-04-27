const { connectDB } = require("../mongo");
const { generateToken } = require("../auth");
const { ObjectId } = require('mongodb');
const bcrypt = require("bcryptjs");


const resolvers = {
    getUsers: async () => {
        const db = await connectDB();
        return await db.collection("users").find().toArray();
    },

    getCards: async () => {
        const db = await connectDB();
        return await db.collection("cards").find().toArray();
    },

    userByEmail: async ({ email }) => {
        const db = await connectDB();
        return await db.collection("users").findOne({ email });
    },

    cardsByEmail: async ({ email }) => {
        const db = await connectDB();
        return await db.collection("cards").find({ email }).toArray();
    },

    cardsByType: async ({ volunType }) => {
        const db = await connectDB();
        return await db.collection("cards").find({ volunType }).toArray();
    },

    createUser: async ({ input }) => {
        const db = await connectDB();
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ email: input.email });
        if (existingUser) throw new Error("Usuario ya existe");

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const newUser = {
            name: input.name,
            email: input.email,
            password: hashedPassword
        };

        await usersCollection.insertOne(newUser);
        return 'Usuario registrado correctamente';
    },

    updateUser: async ({ email, input }) => {
        const db = await connectDB();
        const existingUser = await db.collection("users").findOne({ email });

        if (!existingUser) {
            throw new Error("Usuario no encontrado")
        }

        await db.collection("users").findOneAndUpdate(
            { email },
            { $set: input },
            { returnDocument: "after" }
        );

        return `Usuario ${email} actualizado correctamente`
    },

    deleteUser: async ({ email }) => {
        const db = await connectDB();
        const result = await db.collection("users").deleteOne({ email });
        //return result.deletedCount > 0;
        return `Usuario con email ${email} eliminado correctamente`
    },

    createCard: async ({ input }) => {
        const db = await connectDB();
        const user = await db.collection("users").findOne({ email: input.email });


        if (user) {
            if (user.email === input.email && user.name == input.autor) {
                await db.collection("cards").insertOne(input);
            } else {
                throw new Error("No corresponde el autor del voluntariado con el usuario (email)");

            }
        } else {
            throw new Error("Usuario (email) del voluntariado no encontrado");
        }

        return input;
    },

    updateCard: async ({ cardId, input }) => {
        const db = await connectDB();

        if (!ObjectId.isValid(cardId)) {
            throw new Error("ID de voluntariado inválido");
        }

        // Necesitamos validar el autor y el email
        if (input.email && input.autor) {
            const user = await db.collection("users").findOne({ email: input.email });

            if (!user) {
                throw new Error("Usuario (email) del voluntariado no encontrado");
            }

            if (user.name !== input.autor) {
                throw new Error("No corresponde el autor del voluntariado con el usuario (email)");
            }
        } else {
            throw new Error("Se requiere email y autor para actualizar el voluntariado");
        }

        // validamos si el input de volunType es "Oferta" o "Petición"
        if (input.volunType &&!["Oferta", "Petición"].includes(input.volunType)){
            throw new Error ("Tipo de voluntariado incorrecto, debe ser 'Oferta' o 'Petición'")
        }

        // Si la validación pasa, hacemos el update
        await db.collection("cards").findOneAndUpdate(
            { _id: new ObjectId(cardId) },
            { $set: input },
            { returnDocument: "after" }
        );

        return "Voluntariado actualizado correctamente";
    },

    deleteCard: async ({ cardId }) => {
        const db = await connectDB();
        const result = await db.collection("cards").deleteOne({ _id: new ObjectId(cardId) });
        //return result.deletedCount > 0;
        return `Voluntariado con ID ${cardId} eliminado correctamente`
    },

    login: async ({ email, password }) => {
        const db = await connectDB();
        const user = await db.collection("users").findOne({ email });
        if (!user) throw new Error("Usuario no encontrado");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Contraseña incorrecta");

        return 'Usuario autenticado correctamente, token -> ' + generateToken(user);
    },

    currentUser: async (_args, context) => {
        if (!context.currentUser) throw new Error("No autenticado");

        const db = await connectDB();
        const user = await db.collection("users").findOne({ email: context.currentUser.email });
        if (!user) throw new Error("Usuario no encontrado");

        return user;
    },


    getUserCards: async ({ email }) => {
        const db = await connectDB();
        const userCards = await db.collection('usercards').findOne({ email });
        if (!userCards) {
            throw new Error('Usuario no tiene selección de voluntariados');
        }
        return userCards;
    },

    addUserCard: async ({ email, cardId }) => {
        const db = await connectDB();
        const collection = db.collection('usercards');
        const collectionUsers = db.collection('users');
        const collectionCards = db.collection('cards');
        const user = await collectionUsers.findOne({ email });
        const card = await collectionCards.findOne({ _id: new ObjectId(cardId) });
        const userCards = await collection.findOne({ email });

        if (userCards) {
            const exists = userCards.selectedCards.some(c => c._id.toString() === card._id.toString());
            if (!exists) {
                await collection.updateOne(
                    { email },
                    { $push: { selectedCards: card } }
                );
            }
        } else if (user) {
            // Si no existe, creamos uno nuevo
            await collection.insertOne({
                email,
                selectedCards: [card],
            });
        }

        return await collection.findOne({ email });
    },
    deleteUserCard: async ({ email, cardId }) => {
        const db = await connectDB();
        const collection = db.collection('usercards');
        const collectionCards = db.collection('cards');
        const card = await collectionCards.findOne({ cardId });
        const userCards = await collection.findOne({ email });
        if (!userCards) {
            throw new Error('No se encontró el usuario');
        }

        const objectId = new ObjectId(cardId);
        const exists = userCards.selectedCards.some(c => c._id.toString() === objectId.toString());
        if (!exists) {
            throw new Error('El voluntariado no fue seleccionado para este usuario');
        }

        await collection.updateOne(
            { email },
            { $pull: { selectedCards: { _id: objectId } } }
        );

        return await collection.findOne({ email });
    },


};

module.exports = resolvers;
