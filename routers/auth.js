const express=require("express")
const router=express.Router()
const authControllers=require("../controllers/authentication");
const verify=require("../middleware/verify")


router.post("/signUp",authControllers.createNewUser);
router.post("/userLogin",authControllers.userLogin);
router.get("/viewUsers/:companyName",verify,authControllers.viewUsers)
router.get("/getUser/:companyName/:userId",verify,authControllers.getUser);
router.put("/updateUser/:companyName/:userId",verify,authControllers.updateUser)
router.delete("/deleteUser/:companyName/:userId",verify,authControllers.deleteUser)
// router.delete("/deleteCompany/:companyName",verify,authControllers.deleteCompany);

router.get("/searchUser/:companyName/:searchedText",verify,authControllers.searchUser)

module.exports=router;

