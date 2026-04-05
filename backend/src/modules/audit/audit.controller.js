import * as auditService from './audit.service.js';
import { AppError } from '../../utils/AppError.js';

export async function getMyLogs(req, res, next) {
  try {
    if (!req.admin) throw new AppError("No autenticado", 401);
    
    const logs = await auditService.listMyLogs(req.admin.id);
    res.status(200).json({ ok: true, data: logs });
  } catch (err) {
    next(err);
  }
}
