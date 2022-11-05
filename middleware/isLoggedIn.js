const { HTTPStatus } = require("../enums");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

async function isLoggedIn(req, res, next) {
  //prettier-ignore
  if (!req.headers.authorization)
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "Bad Request" });

  const [bearer, token] = req.headers.authorization.split(" ");

  //prettier-ignore
  if (bearer !== "Bearer")
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "Bad Request" });

  const tokenData = jwt.decode(token);

  if (!tokenData)
    return res.status(HTTPStatus.BadRequest).json({ message: "Bad Request" });

  if (!tokenData._id)
    return res
      .status(HTTPStatus.Unauthorized)
      .json({ message: "Unauthorized" });

  console.log("tokenData._id :", tokenData._id);

  const user = await User.findById(tokenData._id);

  if (!user)
    return res
      .status(HTTPStatus.InternalServerError)
      .json({ message: "Internal Server Error" });

  req.user = user;

  next();
}

module.exports = isLoggedIn;
