function checkAuthentication(req, res, next) {
  console.log("ingreso a check", req.session);
  if (req.session && req.session.userId && req.session.rol) {
    console.log("tengo session", req.session);
    return next();
  } else {
    res.redirect("/");
  }
}

module.exports = {
  checkAuthentication,
};
