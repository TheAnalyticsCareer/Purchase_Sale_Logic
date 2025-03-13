const express=require("express")
const router=express.Router()
const salesControllers=require("../controllers/sales")
const verify=require("../middleware/verify")

router.post("/salesEntry/:companyName",verify,salesControllers.salesEntry);

// router.get("/viewSalesRecord/:companyName",verify,salesControllers.viewSalesRecord);

router.get("/viewSalesRecord/:companyName/:month/:year",verify,salesControllers.viewSalesRecord);

router.get("/getUniqueSale/:companyName/:saleId",verify,salesControllers.viewUniqueSaleRecord)

router.put("/updateSalesRecord/:companyName/:saleId",verify,salesControllers.updateSalesRecord);

router.delete("/deleteSalesRecord/:companyName/:saleId",verify,salesControllers.deleteSalesRecord);

router.get("/searchSalesRecord/:companyName/:searchedText",verify,salesControllers.searchSalesRecord)


module.exports=router;