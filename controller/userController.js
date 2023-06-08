const User = require("../model/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please Enter all the Feilds" });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return res.status(400).json({ error: "User not found" });
  }
};

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({ error: "Please Enter all filled" });
  }
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return res.status(401).json({ error: "Invalid Email or Password" });
  }
};
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  //
  res.json({ users });
};

module.exports = { registerUser, authUser, allUsers };
