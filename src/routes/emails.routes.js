import { Router } from 'express';
import { getActivationCodeController } from '../controllers/emails.controllers';

const emailRoutes = Router();

emailRoutes.post('/getInbox', emailProviderVerifyMiddleware, getActivationCodeController);

export default emailRoutes;
