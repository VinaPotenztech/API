const express=require('express');
const router=express.Router();
const userController=require('../controllers/userController');

router.post("/register",userController.registerUser);
router.post("/login",userController.loginUser);
router.post("/forgot-password",userController.forgotPassword);
router.post("/reset-password",userController.resetPassword);
router.post("/change-password",userController.changePassword);
router.put("/update-profile",userController.updateProfile);

module.exports = router;
