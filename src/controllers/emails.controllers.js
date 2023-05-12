import { getActivationCodeService } from '../services/email.services';
import { connectEmail } from '../services/connect.services';

export const getActivationCodeController = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // todo: inject user obj to request with host info with middleware;
  const host = req.user.host;
  const code = connectEmail(email, password, host, getActivationCodeService);
};
