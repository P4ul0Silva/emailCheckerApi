const emailProviderVerifyMiddleware =
  ('/emails',
  (req, res, next) => {
    const email = req.body.email;
    next();
  });
