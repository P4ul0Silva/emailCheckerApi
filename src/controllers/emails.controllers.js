import { getActivationCodeService } from '../services/email.services.js';
import { connectEmail } from '../services/connect.services.js';
import { database } from '../database/database.js';

export const getActivationCodeController = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // todo: inject user obj to request with host info with middleware;
  const host = req.user.host;

  try {
    const code = await connectEmail(email, password, host, getActivationCodeService);
    res.status(200).json({ code });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  // const code = await getActivationCodeService(database);
};
