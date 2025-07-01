const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.status(400).json({ msg: "Username already used", status: false });

    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.status(400).json({ msg: "Email already used", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const userObject = user.toObject();
    delete userObject.password;

    return res.status(201).json({ status: true, user: userObject });
  } catch (ex) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");

    if (!user)
      return res.status(401).json({ msg: "Incorrect username or password", status: false });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ msg: "Incorrect username or password", status: false });

    const userObject = user.toObject();
    delete userObject.password;

    return res.status(200).json({ status: true, user: userObject });
  } catch (ex) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.setAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;

    const userData = await User.findByIdAndUpdate(
      userId,
      { isAvatarImageSet: true, avatarImage },
      { new: true }
    );

    if (!userData) return res.status(404).json({ msg: "User not found" });

    return res.status(200).json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    return res.status(200).json(users);
  } catch (ex) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }
    // Optional: Clear session storage if using sessions
    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (ex) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};