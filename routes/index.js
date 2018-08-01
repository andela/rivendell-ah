const router = require("express").Router();

router.use("/api", require("./api"));
// return for call to /api
router.get("/api", (req, res) => {
  return res.status(200).send({ message: 'Author\'s Haven is up and running' });
})

module.exports = router;
