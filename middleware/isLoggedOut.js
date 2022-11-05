const { HTTPStatus } = require("../enums");

function isLoggedOut(req, res, next) {
  //prettier-ignore
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  )
    return res
      .status(HTTPStatus.BadRequest)
      .json({ message: "Bad Request" });

  next();
}

module.exports = isLoggedOut;
