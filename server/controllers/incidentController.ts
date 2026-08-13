import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { dbStore } from '../db/store';
import { analyzeIncidentWithGemini } from '../services/geminiService';

export const createIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, locationName, latitude, longitude, imageUrl, isAnonymous } = req.body;

    if (!title || !description || !category || !locationName) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and location name are required.',
      });
    }

    const lat = latitude ? parseFloat(latitude) : 23.8103;
    const lng = longitude ? parseFloat(longitude) : 90.4125;

    // Run AI analysis on the report
    const aiResult = await analyzeIncidentWithGemini(title, description, category);

    const reporter = req.user
      ? {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        }
      : undefined;

    const incident = await dbStore.createIncident({
      title,
      description,
      category,
      locationName,
      latitude: lat,
      longitude: lng,
      imageUrl: imageUrl || '',
      isAnonymous: Boolean(isAnonymous),
      reporter,
      reporterId: req.user?._id,
      status: 'PENDING',
      riskLevel: aiResult.riskLevel,
      urgencyLevel: aiResult.urgencyLevel,
      aiClassification: aiResult.incidentType,
      aiSummary: aiResult.shortSummary,
      aiRecommendation: aiResult.recommendedAction,
      aiConfidenceScore: aiResult.confidenceScore,
      aiAnalysis: aiResult,
      verifiedByAdmin: false,
    });

    // Notify admins of new high/critical incident if applicable
    if (aiResult.riskLevel === 'HIGH' || aiResult.riskLevel === 'CRITICAL') {
      await dbStore.createNotification({
        userId: 'ADMIN_ALL',
        title: `CRITICAL ALERT: ${aiResult.riskLevel} Risk Incident`,
        message: `A new ${aiResult.riskLevel} risk incident "${title}" was submitted in ${locationName}.`,
        type: 'NEW_REPORT',
        incidentId: incident._id,
      });
    }

    // Notify submitting citizen
    if (req.user) {
      await dbStore.createNotification({
        userId: req.user._id,
        title: 'Incident Report Submitted',
        message: `Your report "${title}" has been registered. AI Risk Assessment: ${aiResult.riskLevel}. Status: PENDING.`,
        type: 'NEW_REPORT',
        incidentId: incident._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully!',
      incident,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating incident' });
  }
};

export const getIncidents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, status, riskLevel, search, myReportsOnly } = req.query;
    let incidents = await dbStore.getIncidents();

    // Filter by my reports if requested
    if (myReportsOnly === 'true' && req.user) {
      incidents = incidents.filter(i => i.reporterId === req.user._id);
    }

    // Filters
    if (category && category !== 'ALL') {
      incidents = incidents.filter(i => i.category === category);
    }

    if (status && status !== 'ALL') {
      incidents = incidents.filter(i => i.status === status);
    }

    if (riskLevel && riskLevel !== 'ALL') {
      incidents = incidents.filter(i => i.riskLevel === riskLevel);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      incidents = incidents.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.locationName.toLowerCase().includes(q)
      );
    }

    // Mask anonymous reporters if non-admin or public viewing
    const sanitized = incidents.map(inc => {
      if (inc.isAnonymous && (!req.user || req.user.role !== 'ADMIN')) {
        return {
          ...inc,
          reporter: {
            _id: 'anonymous',
            name: 'Anonymous Citizen',
            email: undefined,
            phone: undefined,
          },
        };
      }
      return inc;
    });

    res.json({ success: true, count: sanitized.length, incidents: sanitized });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getIncidentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const incident = await dbStore.getIncidentById(id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    let result = { ...incident };
    if (result.isAnonymous && (!req.user || req.user.role !== 'ADMIN')) {
      result.reporter = {
        _id: 'anonymous',
        name: 'Anonymous Citizen',
      };
    }

    res.json({ success: true, incident: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dbStore.getIncidentById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    // Citizen can only update their own report while it's still PENDING
    if (req.user.role !== 'ADMIN') {
      if (existing.reporterId !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to edit this report' });
      }
      if (existing.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Cannot edit report after it is under review or verified' });
      }
    }

    const { title, description, category, locationName, latitude, longitude, isAnonymous, imageUrl } = req.body;

    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (locationName) updates.locationName = locationName;
    if (latitude) updates.latitude = parseFloat(latitude);
    if (longitude) updates.longitude = parseFloat(longitude);
    if (isAnonymous !== undefined) updates.isAnonymous = Boolean(isAnonymous);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    // Re-run AI analysis if title or description changed
    if (title || description) {
      const aiResult = await analyzeIncidentWithGemini(
        title || existing.title,
        description || existing.description,
        category || existing.category
      );
      updates.riskLevel = aiResult.riskLevel;
      updates.urgencyLevel = aiResult.urgencyLevel;
      updates.aiClassification = aiResult.incidentType;
      updates.aiSummary = aiResult.shortSummary;
      updates.aiRecommendation = aiResult.recommendedAction;
      updates.aiConfidenceScore = aiResult.confidenceScore;
      updates.aiAnalysis = aiResult;
    }

    const updated = await dbStore.updateIncident(id, updates);

    res.json({ success: true, message: 'Incident updated successfully', incident: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dbStore.getIncidentById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    if (req.user.role !== 'ADMIN') {
      if (existing.reporterId !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this report' });
      }
      if (existing.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Cannot delete report after review has started' });
      }
    }

    await dbStore.deleteIncident(id);
    res.json({ success: true, message: 'Incident report deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
