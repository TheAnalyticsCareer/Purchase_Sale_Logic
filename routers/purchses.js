const express=require("express")
const router=express.Router()
const purchaseControllers=require("../controllers/purchase")
const verify=require("../middleware/verify")

router.post("/purchaseEntry/:companyName",verify,purchaseControllers.purchaseEntry);

// router.get("/viewPurchaseRecord/:companyName",verify,purchaseControllers.viewPurchaseRecord);

router.get("/viewPurchaseRecord/:companyName/:month/:year",verify,purchaseControllers.viewPurchaseRecord);

router.get("/viewPurchaseRecord/:companyName/:month/:year/:date",verify,purchaseControllers.viewPurchaseRecord);

router.get("/getUniquePurchase/:companyName/:purchaseId",verify,purchaseControllers.viewUniquePurchaseRecord);

router.put("/updatePurchaseRecord/:companyName/:purchaseId",verify,purchaseControllers.updatePurchaseRecord);

router.delete("/deletePurchaseRecord/:companyName/:purchaseId",verify,purchaseControllers.deletePurchaseRecord);

router.get("/searchPurchaseRecord/:companyName/:searchedText",verify,purchaseControllers.searchPurchaseRecord);


module.exports=router;