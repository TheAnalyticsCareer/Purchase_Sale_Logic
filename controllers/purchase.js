const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// -----------Purchase Entry----------------------

const purchaseEntry = async (req, res, next) => {
  const {
    purchase_date,
    purchase_type,
    purchase_product,
    purchase_person,
    purchase_supplier,
    purchase_amount,
    purchase_commission,
    payment_type,
    payment_condition,
    payment_date,
  } = req.body;

  let companyName = req.params.companyName;
  companyName = companyName.toLowerCase();

  console.log("companyName---", companyName);

  try {
    const purchase_id = uuidv4();
    const insertpurchaseEntry = `INSERT INTO \`${companyName}_purchase\`
        (purchase_id,purchase_date,purchase_type,purchase_product,purchase_person,purchase_supplier,purchase_amount,purchase_commission,payment_type,payment_condition,payment_date) 
    VALUES(?,?,?,?,?,?,?,?,?,?,?)`;

    await pool.query(insertpurchaseEntry, [
      purchase_id,
      purchase_date,
      purchase_type,
      purchase_product,
      purchase_person,
      purchase_supplier,
      purchase_amount,
      purchase_commission,
      payment_type,
      payment_condition,
      payment_date,
    ]);

    return res
      .status(200)
      .json({ message: "purchase Entry added successfully" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// -----------------------view purchase record--------------------------------

// const viewPurchaseRecord = async (req, res, next) => {
//   let companyName = req.params.companyName;
//   companyName = companyName.toLowerCase();

//   console.log("companyName---", companyName);
//   try {
//     const purchaseRecordListQuery = `SELECT * FROM \`${companyName}_purchase\``;
//     console.log("Executing Query:", purchaseRecordListQuery);

//     const [rows] = await pool.query(purchaseRecordListQuery);
//     return res
//       .status(200)
//       .json({ message: "Purchase record fetched successfully", result: rows });
//   } catch (err) {
//     console.error("Error fetching purchase records:", err);
//     return res.status(500).json({ message: err.message });
//   }
// };


// ----------------------data based on month date -------------------------


const viewPurchaseRecord = async (req, res, next) => {
  let companyName = req.params.companyName;
  companyName = companyName.toLowerCase();

  let { month, year, date } = req.params; 
  const today = new Date();

  // If no month & year provided, use current month & year
  if (month==="" || year==="" || date==="") {
    month = today.getMonth() + 1; 
    year = today.getFullYear();
    date=today.getDate();
  }

  console.log("Fetching records for:", month, year, date);

  try {
    const purchaseRecordListQuery = `
      SELECT * FROM \`${companyName}_purchase\`
      WHERE YEAR(purchase_date) = ? AND MONTH(purchase_date) = ? AND DAY(purchase_date)=?
    `;

    console.log("Executing Query:", purchaseRecordListQuery);

    const [rows] = await pool.query(purchaseRecordListQuery, [year, month, date]);

    return res.status(200).json({
      message: "Purchase record fetched successfully",
      result: rows,
    });
  } catch (err) {
    console.error("Error fetching purchase records:", err);
    return res.status(500).json({ message: err.message });
  }
};




// ---------get purchase record based on purchase id---------------------

const viewUniquePurchaseRecord = async (req, res, next) => {
  let companyName = req.params.companyName;
  let purchaseId = req.params.purchaseId;
  companyName = companyName.toLowerCase();

  console.log("purchaseId", purchaseId);
  console.log("Received companyName:", companyName);

  try {
    const purchaseRecordListQuery = `SELECT * FROM \`${companyName}_purchase\` WHERE purchase_id=?`;

    const [rows] = await pool.query(purchaseRecordListQuery, [purchaseId]);

    console.log("[rows] after getting unique purchase:", rows);

    if (rows.length === 0) {
      console.warn("No records found for the given purchase id");
    }

    return res
      .status(200)
      .json({ message: "Purchase record fetched successfully", result: rows });
  } catch (err) {
    console.error("Error fetching purchase records:", err);
    return res.status(500).json({ message: err.message });
  }
};

// -------------update purchase record-----------------------

const updatePurchaseRecord = async (req, res, next) => {
  const {
    purchase_date,
    purchase_type,
    purchase_product,
    purchase_person,
    purchase_supplier,
    purchase_amount,
    purchase_commission,
    payment_type,
    payment_condition,
    payment_date,
  } = req.body;

  const purchaseId = req.params.purchaseId;

  let companyName = req.params.companyName;
  companyName = companyName.toLowerCase();

  try {
    const updatePurchaseRecordQuery = `UPDATE \`${companyName}_purchase\` SET purchase_date=?,purchase_type=?,purchase_product=?,purchase_person=?,purchase_supplier=?,purchase_amount=?,purchase_commission=?,payment_type=?,payment_condition=?,payment_date=? WHERE purchase_id =?`;

    await pool.query(updatePurchaseRecordQuery, [
      purchase_date,
      purchase_type,
      purchase_product,
      purchase_person,
      purchase_supplier,
      purchase_amount,
      purchase_commission,
      payment_type,
      payment_condition,
      payment_date,
      purchaseId,
    ]);

    const updatedPurchaseRecord = {
      purchase_date,
      purchase_type,
      purchase_product,
      purchase_person,
      purchase_supplier,
      purchase_amount,
      purchase_commission,
      payment_type,
      payment_condition,
      payment_date,
    };

    return res.status(200).json({
      message: "Purchase record updated successfully",
      result: updatedPurchaseRecord,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// ---------------delete purchase record--------------------------

const deletePurchaseRecord = async (req, res, next) => {
  let companyName = req.params.companyName;
  companyName=companyName.toLowerCase();
  
  
  const purchaseId = req.params.purchaseId;

  try {
    const deletePurchaseRecordQuery = `DELETE FROM \`${companyName}_purchase\` WHERE purchase_id=?`;

    await pool.query(deletePurchaseRecordQuery, [purchaseId]);
    return res
      .status(200)
      .json({ message: "Purcahse record deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// --------------search purchase record--------------------

const searchPurchaseRecord = async (req, res, next) => {
  let companyName = req.params.companyName;
  companyName=companyName.toLowerCase();
  const searchedText = req.params.searchedText;

  console.log("searched text---",searchedText)

  try {
    // if (!/^[a-zA-Z0-9_]+$/.test(companyName)) {
    //     return res.status(400).json({ error: "Invalid company name" });
    // }

    const searchPurchaseRecordQuery = `
            SELECT * FROM \`${companyName}_purchase\`
            WHERE 
                purchase_date LIKE ? OR
                purchase_type LIKE ? OR
                purchase_product LIKE ? OR
                purchase_person LIKE ? OR
                purchase_supplier LIKE ? OR
                purchase_amount LIKE ? OR
                purchase_commission LIKE ? OR
                payment_type LIKE ? OR
                payment_condition LIKE ? OR
                payment_date LIKE ?
        `;

    const searchValue = `%${searchedText}%`;

    const [results] = await pool.query(searchPurchaseRecordQuery, [
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
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
  purchaseEntry,
  viewPurchaseRecord,
  viewUniquePurchaseRecord,
  updatePurchaseRecord,
  deletePurchaseRecord,
  searchPurchaseRecord,
};
