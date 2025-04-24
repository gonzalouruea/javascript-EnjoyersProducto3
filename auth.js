// auth.js
const jwt = require("jsonwebtoken");

const SECRET_KEY = "Miniatura";

const auth ={
    generateToken : (user) => {
        return jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "1h" });
      },
    verifyToken : (token) => {
        try {
          return jwt.verify(token, SECRET_KEY);
        } catch (err) {
          return null;
        }
      }

}
module.exports = auth;
