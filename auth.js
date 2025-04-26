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
      },

      
    getUserFromToken : (token) => {
    if (!token) return null;
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded;
    } catch (err) {
      console.error("Token inválido:", err);
      return null;
    }
  }

}

  
module.exports = auth;
