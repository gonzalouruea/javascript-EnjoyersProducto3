const { connectDB } = require("../mongo");
const { generateToken } = require("../auth");
const { ObjectId } = require('mongodb');
const bcrypt = require("bcryptjs");

let userSelections = new Map() // declaramos un map para agregar voluntariados por email

const resolvers = {
    users: async () => {
        const db = await connectDB();
        return await db.collection("users").find().toArray();
    },

    cards: async () => {
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
        return newUser;
    },

    updateUser: async ({ email, input }) => {
        const db = await connectDB();
        const result = await db.collection("users").findOneAndUpdate(
            { email },
            { $set: input },
            { returnDocument: "after" }
        );

        console.log (result.value);

        if (!result.value) throw new Error("Usuario no encontrado");
        return result.value;
    },


    /*deleteUser: async ({ email }) => {
        const db = await connectDB();
        const result = await db.collection("users").deleteOne({ email });
        if(!result.deletedCount>0){
            throw new Error("El usuario no ha sido borrado ya que no existe");
        }
        return result.deletedCount > 0;
    },*/

    deleteUser: async ({ email }) => {
        const db = await connectDB();
        const result = await db.collection("users").deleteOne({ email });
    
        if (result.deletedCount === 0) {
            // Si no se eliminó ningún usuario, lanzamos un error
            return {
                success: false,
                message: "El usuario no ha sido borrado ya que no existe"
            };
        } else {
            // Si el usuario fue eliminado correctamente, devolvemos éxito y mensaje
            return {
                success: true,
                message: "Usuario borrado correctamente"
            };
        }
    },
    







    createCard: async ({ input }) => {
        const db = await connectDB();
        //const user = await db.collection("users").findOne(input.email);
        const user = await db.collection("users").findOne({ email: input.email });


        if (user) {
            if (user.email === input.email && user.name == input.autor) {
                await db.collection("cards").insertOne(input);
            } else {
                throw new Error("No corresponde el autor de la card con el usuario");

            }
        } else {
            throw new Error("Usuario de card no encontrado");
        }

        return input;
    },

    updateCard: async ({ cardId, input }) => {
        const db = await connectDB();

        if (!ObjectId.isValid(cardId)) {
            throw new Error("ID de Card inválido");
          }
        

        if(input.email){
            const user = await db.collection("users").findOne({ email: input.email });
            if (user) {
                if (user.email === input.email) {
                    const result = await db.collection("cards").findOneAndUpdate(
                        { _id: new ObjectId(cardId) },
                        { $set: input },
                        { returnDocument: "after" }
                    );
                    console.log(result);
                    if (!result) return "Card no encontrada";
                    return "Card actualizada correctamente";
                } else {
                    return "No corresponde el autor de la card con el usuario";
                }
            } else {
                return "Usuario de card no encontrado";
            }
        }else if(input.autor){
            const user = await db.collection("users").findOne({ name: input.autor });
            if (user) {
                if (user.name == input.autor) {
                    const result = await db.collection("cards").findOneAndUpdate(
                        { _id: new ObjectId(cardId) },
                        { $set: input },
                        { returnDocument: "after" }
                    );
                    console.log(result);
                    if (!result) return "Card no encontrada";
                    return "Card actualizada correctamente";
                } else {
                    return "No corresponde el autor de la card con el usuario";
                }
            } else {
                return"Usuario de card no encontrado";
            }
        }else{
            const result = await db.collection("cards").findOneAndUpdate(
                { _id: new ObjectId(cardId) },
                { $set: input },
                { returnDocument: "after" }
            );
            console.log(result);
            if (!result) return "Card no encontrada";
            return "Card actualizada correctamente";
        }

       

    },

   /*deleteCard: async ({ cardId }) => {
        const db = await connectDB();
        const result = await db.collection("cards").deleteOne({ _id: new ObjectId(cardId) });
        return result.deletedCount > 0;
    },*/

    deleteUser: async ({ cardId }) => {
        const db = await connectDB();
        const result = await db.collection("cards").deleteOne({ _id: new ObjectId(cardId) });
    
        if (result.deletedCount === 0) {
            // Si no se eliminó ningún usuario, lanzamos un error
            return {
                success: false,
                message: "El usuario no ha sido borrado ya que no existe"
            };
        } else {
            // Si el usuario fue eliminado correctamente, devolvemos éxito y mensaje
            return {
                success: true,
                message: "Usuario borrado correctamente"
            };
        }
    },







    login: async ({ email, password }) => {
        const db = await connectDB();
        const user = await db.collection("users").findOne({ email });
        if (!user) throw new Error("Usuario no encontrado");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Contraseña incorrecta");

        return generateToken(user);
    },

    currentUser: async (_args, context) => {
        if (!context.currentUser) throw new Error("No autenticado");

        const db = await connectDB(); // tu función de conexión
        const user = await db.collection("users").findOne({ email: context.currentUser.email });
        if (!user) throw new Error("Usuario no encontrado");

        return user;
    },


    getUserCards: async ({ email }) => {
        const db = await connectDB();
        const userCards = await db.collection('usercards').findOne({ email });
        if (!userCards) {
            throw new Error('No se encontraron tarjetas para este usuario');
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
            throw new Error('La card no fue seleccionada para este usuario');
        }

        await collection.updateOne(
            { email },
            { $pull: { selectedCards: { _id: objectId } } }
        );

        return await collection.findOne({ email });
    },


};

module.exports = resolvers;
