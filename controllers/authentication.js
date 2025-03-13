const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const createNewUser = async (req, res) => {
  const { fullName, email, password, companyName } = req.body;
  let { department } = req.body;

  department = department.toLowerCase();

  const providedCompanyID = req.body.companyId;

  const usersTable = `${companyName}_Users`.replace(/\s+/g, "_").toLowerCase();
  const salesTable = `${companyName}_Sales`.replace(/\s+/g, "_").toLowerCase();
  const purchaseTable = `${companyName}_Purchase`
    .replace(/\s+/g, "_")
    .toLowerCase();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();

    const checkCompanyQuery = `
    SELECT TABLE_NAME 
    FROM information_schema.tables 
    WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = ?;
  `;

    const [checkCompanyExists] = await pool.query(checkCompanyQuery, [
      process.env.Database,
      usersTable,
    ]);

    let companyId = null;

    if (checkCompanyExists.length === 0) {
      if (department !== "admin") {
        return res
          .status(400)
          .json({ message: "Only admin can Sign Up for the first time." });
      }

      companyId = uuidv4().slice(0, 8); // Generate 8-character unique company ID

      // ------------- Creating new company -----------------------------

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`${usersTable}\` (
          user_id CHAR(36) PRIMARY KEY,  
          fullName VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          companyName VARCHAR(100),
          department VARCHAR(100),
          company_Id CHAR(8),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`${salesTable}\` (
          sale_id CHAR(36) PRIMARY KEY,  
          sale_date DATE,
          sale_type VARCHAR(50),
          sale_product VARCHAR(100),
          sale_person VARCHAR(100),
          sale_customer VARCHAR(100),
          sale_amount DECIMAL(10,2),
          sale_commission DECIMAL(10,2),
          payment_type VARCHAR(50),
          payment_condition VARCHAR(50),
          payment_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`${purchaseTable}\` (
          purchase_id CHAR(36) PRIMARY KEY,  
          purchase_date DATE,
          purchase_type VARCHAR(50),
          purchase_product VARCHAR(100),
          purchase_person VARCHAR(100),
          purchase_supplier VARCHAR(100),
          purchase_amount DECIMAL(10,2),
          purchase_commission DECIMAL(10,2),
          payment_type VARCHAR(50),
          payment_condition VARCHAR(50),
          payment_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // ------------ Inserting new user for the first time --------------------------------

      await pool.query(
        `
        INSERT INTO \`${usersTable}\` (user_id, fullName, email, password, companyName, department, company_Id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          user_id,
          fullName,
          email,
          hashedPassword,
          companyName,
          department,
          companyId,
        ]
      );

      return res.status(201).json({
        message: "User added successfully",
        user: {
          user_id,
          fullName,
          email,
          companyName,
          department,
          companyId,
        },
      });
    } else {
      if (department === "admin") {
        return res.status(400).json({ message: "Admin already exists." });
      }

      if (department !== "sales" && department !== "purchase") {
        return res.status(400).json({
          message: "You can only Sign Up for the Sales or Purchase department.",
        });
      }

      if (!providedCompanyID) {
        return res.status(400).json({ message: "Company exists." });
      }

      //  ----------- Checking if users exist in the company with the provided ID ----------
      const checkUserQuery = `SELECT COUNT(*) AS userCount FROM \`${usersTable}\` WHERE company_Id = ?`;
      const [result] = await pool.query(checkUserQuery, [providedCompanyID]);

      if (result[0].userCount > 0) {
        await pool.query(
          `
          INSERT INTO \`${usersTable}\` (user_id, fullName, email, password, companyName, department, company_Id) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            user_id,
            fullName,
            email,
            hashedPassword,
            companyName,
            department,
            providedCompanyID,
          ]
        );

        return res.status(201).json({
          message: "User added successfully",
          user: {
            user_id,
            fullName,
            email,
            companyName,
            department,
            providedCompanyID,
          },
        });
      } else {
        return res
          .status(400)
          .json({ message: `Company with this ID does not exist.` });
      }
    }
  } catch (error) {
    console.error("Error in createNewUser:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// ------------------------login user-----------------------
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  let { companyName } = req.body;
  companyName = companyName.toLowerCase();

  try {
    const checkUserQuery = `SELECT * FROM \`${companyName}_users\` WHERE email = ?`;
    const [rows] = await pool.query(checkUserQuery, [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found." });
    }

    const user = rows[0];

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user.user_id }, process.env.SecretKey);

    delete user.password;

    return res.status(200).json({
      message: "User Logged in!",
      user,
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// --------------------view users------------------------------
const viewUsers = async (req, res) => {
  try {
    let companyName = req.params.companyName;
    companyName = companyName.toLowerCase();
    const userQuery = `SELECT * FROM \`${companyName}_users\``;
    const [users] = await pool.query(userQuery);
    return res
      .status(200)
      .json({ message: "Users fetched successfully", result: users });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// -------------------get user based on id---------------------------

const getUser = async (req, res, next) => {
  let companyName = req.params.companyName;
  companyName = companyName.toLowerCase();
  let { userId } = req.params;

  try {
    const userListQuery = `SELECT * FROM \`${companyName}_users\` WHERE user_id=?`;

    const [rows] = await pool.query(userListQuery, [userId]);

    if (rows.length === 0) {
      console.warn("No records found for the given user id");
    }
    return res
      .status(200)
      .json({ message: "User fetched successfully", result: rows });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ------------------update user------------------------------

const updateUser = async (req, res, next) => {
  const { fullName, email, department } = req.body;
  let companyName = req.params.companyName;
  companyName = companyName.toLowerCase();
  const { userId } = req.params;

  try {
    const userUpdateQuery = `UPDATE \`${companyName}_users\` SET fullName=?,email=?,department=? WHERE user_id=?`;

    await pool.query(userUpdateQuery, [fullName, email, department, userId]);

    const updatedUser = {
      fullName,
      email,
      department,
    };
    return res
      .status(200)
      .json({ message: "user updated successfully", result: updatedUser });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// --------------------delete user--------------------------

const deleteUser = async (req, res, next) => {
  let companyName = req.params.companyName;
  companyName = companyName.toLowerCase();
  const { userId } = req.params;

  try {
    const userDeleteQuery = `DELETE FROM \`${companyName}_users\` WHERE user_id=? `;

    await pool.query(userDeleteQuery, [userId]);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// ------------------delete company-------------------------------------------------------

const deleteCompany = async (req, res, next) => {
  const companyName = req.params.companyName;
  const user_id = req.user.user_id;

  try {
    const deleteCompanyQuery = `DROP TABLE \`${companyName}_users\` WHERE user_id=? `;

    const delete_purchaseDept = `DROP TABLE \`${companyName}_purchase\`  `;

    const delete_salesDept = `DROP TABLE \`${companyName}_sales\`  `;

    await pool.query(deleteCompanyQuery, [user_id]);
    await pool.query(delete_purchaseDept);
    await pool.query(delete_salesDept);

    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (err) {
    console.log("err---", err);
    return res.status(500).json({ message: err });
  }
};

// --------------------search user--------------------------------

const searchUser = async (req, res, next) => {
  let companyName = req.params.companyName;
  companyName = companyName.toLowerCase();

  const { searchedText } = req.params;

  console.log("searched text---", searchedText);

  try {
    const searchUserQuery = `
    SELECT * FROM \`${companyName}_users\`
    WHERE 
        fullName LIKE ? OR
        email LIKE ? OR
        department LIKE ? OR
        user_id LIKE ?
        
        `;

    const searchValue = `%${searchedText}%`;

    const [results] = await pool.query(searchUserQuery, [
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    ]);

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports = {
  createNewUser,
  userLogin,
  viewUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteCompany,
  searchUser,
};
