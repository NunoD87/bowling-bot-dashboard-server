require("dotenv").config();
const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");

// ℹ️ Handles password encryption
const jwt = require("jsonwebtoken");

// Require the User model in order to interact with the database
const User = require("../models/User.model");

const { HTTPStatus, DiscordGrantType } = require("../enums");
const discordOAuth = require("../services/discordOAuth");
const discordApi = require("../services/discordApi");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");
const { hashToImage } = require("../utils");

const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, TOKEN_SECRET } = process.env;

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", isLoggedOut, async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (email === "" || password === "" || confirmPassword === "")
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "You must provide all fields." });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailRegex.test(email))
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "Invalid email, provide a valid one." });

  if (password !== confirmPassword)
    return res.status(HTTPStatus.BadRequest).json({
      message: "The passwords are different. Please, check both passwords.",
    });

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

  if (!passwordRegex.test(password))
    return res.status(HTTPStatus.BadRequest).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });

  const anyUser = await User.findOne({ email });

  if (anyUser)
    return res.status(HTTPStatus.BadRequest).json({
      message: "That email is already registered. Please, try another one.",
    });

  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const user = await User.create({ email, password: hashedPassword });

  if (!user)
    return res.status(HTTPStatus.InternalServerError).json({
      message: "Due to an error, the user wasn't created. Please, try again.",
    });

  return res.status(HTTPStatus.Created).json({ user });
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", isLoggedOut, async (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "")
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "You must provide both email and password." });

  const user = await User.findOne({ email });

  if (!user)
    return res
      .status(HTTPStatus.NotFound)
      .json({ message: "That user doesn't exist." });

  const isSamePassword = bcrypt.compareSync(password, user.password);

  if (!isSamePassword)
    return res
      .status(HTTPStatus.Unauthorized)
      .json({ message: "Incorrect password." });

  const token = jwt.sign({ _id: user._id }, TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "6h",
  });

  return res.status(HTTPStatus.OK).json({ user, token });
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isLoggedIn, (req, res) => {
  return res.status(HTTPStatus.OK).json(req.user);
});

router.get("/delete", isLoggedIn, async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndDelete(_id);

  return res.status(HTTPStatus.OK).json({ message: "User deleted." });
});

router.post("/discord", isLoggedIn, async (req, res) => {
  const { code } = req.body;

  if (!code)
    return res.status(HTTPStatus.BadRequest).json({
      message: "You must provide the Discord code.",
    });

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: DiscordGrantType.AuthorizationCode,
    code,
    redirect_uri: "http://localhost:3000/discord",
    scope: `identify guilds guilds.members.read`,
  });

  const { data: authorization } = await discordOAuth.token(params);

  if (!authorization)
    return res.status(HTTPStatus.BadRequest).json({
      message: "The Discord code is invalid.",
    });

  const { access_token, refresh_token } = authorization;

  const { data: discordUser } = await discordApi.getMe(access_token);

  if (!discordUser)
    return res.status(HTTPStatus.Unauthorized).json({
      message: "Unauthorized.",
    });

  const { id, username, discriminator, avatar } = discordUser;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      discord: {
        ...discordUser,
        avatar: hashToImage(discordUser.id, discordUser.avatar),
        access_token,
        refresh_token,
      },
    },
    { new: true }
  );

  //prettier-ignore
  if (!user)
    return res
      .status(HTTPStatus.InternalServerError)
      .json({ message: "Due to an error, the user wasn't updated. Please, try again." });

  const token = jwt.sign({ _id: user._id }, TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "6h",
  });

  return res.status(HTTPStatus.OK).json({ user, token });
});

module.exports = router;
