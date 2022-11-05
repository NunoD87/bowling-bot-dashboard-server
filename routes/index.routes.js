const express = require("express");
const router = express.Router();

router.get("/", (res) => {
  res.json("All good in here");
});

router.use("/guild", require("./guild.routes"));
router.use("/config", require("./config.routes"));
router.use("/history", require("./history.routes"));

module.exports = router;
