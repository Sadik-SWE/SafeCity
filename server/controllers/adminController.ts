import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { dbStore } from '../db/store';

export const updateIncidentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, riskLevel, urgencyLevel } = req.body;

    const existing = await dbStore.getIncidentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (riskLevel) updates.riskLevel = riskLevel;
    if (urgencyLevel) updates.urgencyLevel = urgencyLevel;

    if (status === 'VERIFIED') {
      updates.verifiedByAdmin = true;
    }

    const updated = await dbStore.updateIncident(id, updates);

    // Notify the reporter about status update
    if (existing.reporterId) {
      await dbStore.createNotification({
        userId: existing.reporterId,
        title: `Incident Status Update: ${status}`,
        message: `Your report "${existing.title}" status has been updated to ${status}.${adminNotes ? ` Note: ${adminNotes}` : ''}`,
        type: 'STATUS_CHANGE',
        incidentId: id,
      });
    }

    res.json({
      success: true,
      message: `Incident status updated to ${status}`,
      incident: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { verified, adminNotes } = req.body;

    const existing = await dbStore.getIncidentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const isVerified = verified !== undefined ? Boolean(verified) : true;
    const newStatus = isVerified ? 'VERIFIED' : existing.status;

    const updated = await dbStore.updateIncident(id, {
      verifiedByAdmin: isVerified,
      status: newStatus,
      adminNotes: adminNotes || existing.adminNotes,
    });

    if (existing.reporterId) {
      await dbStore.createNotification({
        userId: existing.reporterId,
        title: isVerified ? 'Incident Verified by Authorities' : 'Incident Verification Status Updated',
        message: isVerified
          ? `Your incident report "${existing.title}" has been officialy verified by municipal safety admins.`
          : `Verification status updated for "${existing.title}".`,
        type: 'VERIFICATION',
        incidentId: id,
      });
    }

    res.json({
      success: true,
      message: isVerified ? 'Incident verified successfully' : 'Incident unverified',
      incident: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await dbStore.getUsers();
    // Sanitize passwords
    const sanitized = users.map(u => {
      const userObj = { ...u };
      delete (userObj as any).password;
      return userObj;
    });

    res.json({ success: true, count: sanitized.length, users: sanitized });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleUserActive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await dbStore.getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deactivating own admin account
    if (user._id === req.user._id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own admin account' });
    }

    const updated = await dbStore.updateUser(id, { isActive: !user.isActive });
    const userObj = { ...updated };
    delete (userObj as any).password;

    res.json({
      success: true,
      message: `User account ${updated?.isActive ? 'activated' : 'deactivated'} successfully`,
      user: userObj,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['CITIZEN', 'ADMIN', 'MODERATOR'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await dbStore.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await dbStore.updateUser(id, { role });
    const userObj = { ...updated };
    delete (userObj as any).password;

    res.json({ success: true, message: `Role updated to ${role}`, user: userObj });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dbStore.getIncidentById(id);

    if (!existing) {
      const ok = await dbStore.deleteIncident(id);
      if (ok) {
        return res.json({ success: true, message: 'Incident deleted successfully' });
      }
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    await dbStore.deleteIncident(id);
    res.json({ success: true, message: 'Incident report deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await dbStore.getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id) || String(user.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    const success = await dbStore.deleteUser(id);
    if (!success) {
      return res.status(400).json({ success: false, message: 'Failed to delete user' });
    }

    res.json({ success: true, message: 'User account deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
