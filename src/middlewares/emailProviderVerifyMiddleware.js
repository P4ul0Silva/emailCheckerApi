export const emailProviderVerifyMiddleware =
  ('/emails',
  async (req, res, next) => {
    const email = req.body.email;

    if (email.includes('gmail')) {
      req.user = { host: 'imap.gmail.com' };
    } else {
      req.user = { host: 'imap-mail.outlook.com' };
    }
    next();
  });
