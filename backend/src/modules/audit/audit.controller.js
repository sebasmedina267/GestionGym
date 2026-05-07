import * as auditService from './audit.service.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Personal Audit Log Handler
 * 
 * Retrieves the historical trail of operations performed by the currently 
 * authenticated administrator.
 */
export async function getMyLogs(req, res, next) {
  try {
    if (!req.admin) throw new AppError("Authentication required: Identity context is missing", 401);
    
    const logs = await auditService.listMyLogs(req.admin.id);
    res.status(200).json({ ok: true, data: logs });
  } catch (err) {
    next(err);
  }
}
