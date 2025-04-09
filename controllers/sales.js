const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// -----------Sales Entry----------------------

const salesEntry = async (req, res, next) => {
    const {
      sale_date,
      sale_type,
      sale_product,
      sale_person,
      sale_customer,
      sale_amount,
      sale_commission,
      payment_type,
      payment_condition,
      payment_date,
    } = req.body;
  
    let companyName = req.params.companyName;
    companyName = companyName.toLowerCase();
  
    console.log("companyName---", companyName);
  
    try {
      const sale_id = uuidv4();
      const insertSaleEntry = `INSERT INTO \`${companyName}_sales\`
          (sale_id,sale_date,sale_type,sale_product,sale_person,sale_customer,sale_amount,sale_commission,payment_type,payment_condition,payment_date) 
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`;
  
      await pool.query(insertSaleEntry, [
        sale_id,
        sale_date,
        sale_type,
        sale_product,
        sale_person,
        sale_customer,
        sale_amount,
        sale_commission,
        payment_type,
        payment_condition,
        payment_date,
      ]);
  
      return res
        .status(200)
        .json({ message: "Sale Entry added successfully" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  };
  

// ---------------view sales record based on month and year----------------------------



const viewSalesRecord = async (req, res, next) => {
  let companyName = req.params.companyName;
  companyName = companyName.toLowerCase();

  let { month, year, date } = req.params; 
  const today = new Date();

  // If no month & year provided, use current month & year
  if (month==="" || year==="") {
    month = today.getMonth() + 1; 
    year = today.getFullYear();
  }

  console.log("Fetching records for:", month, year, date);

  try {

    if (!date || date.trim() === "") {
      const salesRecordListQuery = `
        SELECT * FROM \`${companyName}_sales\`
        WHERE YEAR(sale_date) = ? AND MONTH(sale_date) = ? order by sale_date desc
      `;
      console.log("Executing Query:", salesRecordListQuery);
      const [rows] = await pool.query(salesRecordListQuery, [year, month]);

      return res.status(200).json({
        message: "Sale record fetched successfully",
        result: rows,
      });
    }





    const salesRecordListQuery = `
      SELECT * FROM \`${companyName}_sales\`
      WHERE YEAR(sale_date) = ? AND MONTH(sale_date)=? AND DAY(sale_date) = ? order by sale_date desc
    `;

    console.log("Executing Query:", salesRecordListQuery);

    const [rows] = await pool.query(salesRecordListQuery, [year, month, date]);

    return res.status(200).json({
      message: "Sale record fetched successfully",
      result: rows,
    });
  } catch (err) {
    console.error("Error fetching sale records:", err);
    return res.status(500).json({ message: err.message });
  }
};


// -------------------filter----------------------------------------


const filterSaleRecord = async (req, res, next) => {
  let companyName = req.params.companyName.toLowerCase();

  let {
    sale_type,
    sale_product,
    sale_person,
    sale_customer,
    created_at,
  } = req.params;

  console.log(
    "Fetching records for:",
    sale_type,
    sale_product,
    sale_person,
    sale_customer,
    created_at
  );

  try {
    const saleRecordListQuery = `
      SELECT * FROM \`${companyName}_sales\`
      WHERE 
        (? IS NULL OR sale_type = ?) AND
        (? IS NULL OR sale_product = ?) AND
        (? IS NULL OR sale_person = ?) AND
        (? IS NULL OR sale_customer = ?) AND
        (? IS NULL OR created_at = ?)
    `;

    const values = [
      sale_type !== "null" ? sale_type : null, sale_type !== "null" ? sale_type : null,
      sale_product !== "null" ? sale_product : null, sale_product !== "null" ? sale_product : null,
      sale_person !== "null" ? sale_person : null, sale_person !== "null" ? sale_person : null,
      sale_customer !== "null" ? sale_customer : null, sale_customer !== "null" ? sale_customer : null,
      created_at !== "null" ? created_at : null, created_at !== "null" ? created_at : null,
    ];

    console.log("Executing Query:", saleRecordListQuery);
    console.log("Values:", values);
    
    const [rows] = await pool.query(saleRecordListQuery, values);

    return res.status(200).json({
      message: "Sale record fetched successfully",
      result: rows,
    });
  } catch (err) {
    console.error("Error fetching sale records:", err);
    return res.status(500).json({ message: err.message });
  }
};






// ---------get sale record based on purchase id---------------------

const viewUniqueSaleRecord = async (req, res, next) => {
    let companyName = req.params.companyName;
    let saleId = req.params.saleId;
    companyName = companyName.toLowerCase();
  
    console.log("saleId",saleId);
    console.log("Received companyName:", companyName);
  
    try {
      const saleRecordListQuery = `SELECT * FROM \`${companyName}_sales\` WHERE sale_id=?`;
  
      const [rows] = await pool.query(saleRecordListQuery, [saleId]);
  
      console.log("[rows] after getting unique sale:", rows);
  
      if (rows.length === 0) {
        console.warn("No records found for the given sale id");
      }
  
      return res
        .status(200)
        .json({ message: "Sale record fetched successfully", result: rows });
    } catch (err) {
      console.error("Error fetching Sale records:", err);
      return res.status(500).json({ message: err.message });
    }
  };
  


// -------------update sales record-----------------------

const updateSalesRecord=async(req,res,next)=>{

    const {sale_date,sale_type,sale_product,sale_person,sale_customer,sale_amount,sale_commission,payment_type,payment_condition,payment_date}=req.body;

    const saleId=req.params.saleId;

    let companyName=req.params.companyName;
    companyName=companyName.toLowerCase();

    try{
        const updateSalesRecordQuery=`UPDATE \`${companyName}_sales\` SET sale_date=?,sale_type=?,sale_product=?,sale_person=?,sale_customer=?,sale_amount=?,sale_commission=?,payment_type=?,payment_condition=?,payment_date=? WHERE sale_id =?`;

        await pool.query(updateSalesRecordQuery,[sale_date,sale_type,sale_product,sale_person,sale_customer,sale_amount,sale_commission,payment_type,payment_condition,payment_date,saleId])

        const updatedSales={
            sale_date,sale_type,sale_product,sale_person,sale_customer,sale_amount,sale_commission,payment_type,payment_condition,payment_date
        }

        return res.status(200).json({message:"Sales record updated successfully",result:updatedSales})
    }catch(err){
        return res.status(500).json({message:err})
    }

}



// -------------------delete sales record--------------------------

const deleteSalesRecord=async(req,res,next)=>{
    let companyName=req.params.companyName;
    companyName=companyName.toLowerCase();
   
    const saleId=req.params.saleId

    try{
        const deleteSalesRecordQuery=`DELETE FROM \`${companyName}_sales\` WHERE sale_id=?`;

        await pool.query(deleteSalesRecordQuery,[saleId]);
        return res.status(200).json({message:"sales record deleted successfully"})
    }catch(err){
        return res.status(500).json({message:err})
    }
}


// --------------search sales record-------------------------

const searchSalesRecord=async(req,res,next)=>{

    let companyName=req.params.companyName;
    companyName=companyName.toLowerCase();
    const searchedText=req.params.searchedText;

    try{

        const searchSalesRecordQuery = `
        SELECT * FROM \`${companyName}_sales\`
        WHERE 
            sale_date LIKE ? OR
            sale_type LIKE ? OR
            sale_product LIKE ? OR
            sale_person LIKE ? OR
            sale_customer LIKE ? OR
            sale_amount LIKE ? OR
            sale_commission LIKE ? OR
            payment_type LIKE ? OR
            payment_condition LIKE ? OR
            payment_date LIKE ?
    `;

    const searchValue = `%${searchedText}%`;

  
    const [results] = await pool.query(searchSalesRecordQuery, 
        [searchValue, searchValue, searchValue, searchValue, searchValue, 
         searchValue, searchValue, searchValue, searchValue, searchValue]);

   
    return res.status(200).json({message:"Searched result---",results});
    }catch(err){
        return res.status(500).json({message:err})
    }
}


module.exports={
    salesEntry,
    viewSalesRecord,
    filterSaleRecord,
    viewUniqueSaleRecord,
    updateSalesRecord,
    deleteSalesRecord,
    searchSalesRecord
    
}