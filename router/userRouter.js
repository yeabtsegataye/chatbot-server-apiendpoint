const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controller/userController");
const { protect } = require("../middleware/authMIddleware");

const router = express.Router();

router.route("/signup").post(registerUser);
router.post("/login", authUser);
router.use(protect);
router.get("/", allUsers);

module.exports = router;
