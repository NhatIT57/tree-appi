const admin = (req, res, next) => {
  if (req.body.user) {
    if (req.body.user.isAdmin) {
      next();
    } else {
      res.status(401);
      res.send("Unauthorized");
    }
  } else {
    res.status(401);
    res.send("Unauthorized");
  }
};

module.exports = admin();
