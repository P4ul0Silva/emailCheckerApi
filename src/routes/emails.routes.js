import { Router } from 'express';
import { getActivationCodeController } from '../controllers/emails.controllers.js';
import { emailProviderVerifyMiddleware } from '../middlewares/emailProviderVerifyMiddleware.js';

const emailRoutes = Router();

emailRoutes.post('/getInbox', emailProviderVerifyMiddleware, getActivationCodeController);

export default emailRoutes;
