const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async function (req, res, next) {
  try {
    
    let companyName = req.params.companyName;
    companyName=companyName.toLowerCase();

    const token = req.headers["authorization"];

    console.log("user token in verify middleware----",token)

                
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const jwtToken = token.split(" ")[1];
    if (!jwtToken) {
      return res.status(401).json({ message: "Malformed token" });
    }

    

    const decoded = jwt.verify(jwtToken, process.env.SecretKey);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.log("decoded data---", decoded);
    console.log("decoded.id----",decoded.id)
    const userquery = `SELECT * FROM \`${companyName}_users\` WHERE user_Id = ?`;
    
    const [getUsers] = await pool.query(userquery, [decoded.id]);

    const user = getUsers[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("user after verification-----", user);

    user.password = undefined;

    req.user = user;
    next();
  } catch (err) {
    console.error("err in catch when verifying ----",err.message);
    return res.status(401).json({ message: "Unauthorized access" });
  }
};
