import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { dbStore } from '../db/store';

export const getOverviewAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const incidents = await dbStore.getIncidents();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    let totalReports = incidents.length;
    let pendingReports = 0;
    let verifiedReports = 0;
    let highRiskReports = 0;
    let criticalReports = 0;
    let resolvedReports = 0;
    let todayReports = 0;
    let weekReports = 0;

    const categoryMap: Record<string, number> = {};
    const riskMap: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const statusMap: Record<string, number> = {
      PENDING: 0,
      UNDER_REVIEW: 0,
      VERIFIED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
    };

    incidents.forEach(inc => {
      const createdTime = new Date(inc.createdAt).getTime();

      if (inc.status === 'PENDING') pendingReports++;
      if (inc.verifiedByAdmin || inc.status === 'VERIFIED') verifiedReports++;
      if (inc.riskLevel === 'HIGH') highRiskReports++;
      if (inc.riskLevel === 'CRITICAL') criticalReports++;
      if (inc.status === 'RESOLVED') resolvedReports++;

      if (createdTime >= todayStart) todayReports++;
      if (createdTime >= weekAgo) weekReports++;

      // Category breakdown
      categoryMap[inc.category] = (categoryMap[inc.category] || 0) + 1;

      // Risk breakdown
      if (riskMap[inc.riskLevel] !== undefined) {
        riskMap[inc.riskLevel]++;
      } else {
        riskMap[inc.riskLevel] = 1;
      }

      // Status breakdown
      if (statusMap[inc.status] !== undefined) {
        statusMap[inc.status]++;
      } else {
        statusMap[inc.status] = 1;
      }
    });

    const categoryStats = Object.keys(categoryMap).map(cat => ({
      name: cat,
      value: categoryMap[cat],
    }));

    const riskStats = Object.keys(riskMap).map(rk => ({
      name: rk,
      value: riskMap[rk],
    }));

    const statusStats = Object.keys(statusMap).map(st => ({
      name: st.replace('_', ' '),
      value: statusMap[st],
    }));

    // Generate last 7 days trend
    const trendMap: Record<string, { reports: number; resolved: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = { reports: 0, resolved: 0 };
    }

    incidents.forEach(inc => {
      const dateStr = inc.createdAt.split('T')[0];
      if (trendMap[dateStr]) {
        trendMap[dateStr].reports++;
        if (inc.status === 'RESOLVED') {
          trendMap[dateStr].resolved++;
        }
      }
    });

    const trendStats = Object.keys(trendMap).map(date => ({
      date,
      reports: trendMap[date].reports,
      resolved: trendMap[date].resolved,
    }));

    res.json({
      success: true,
      analytics: {
        totalReports,
        pendingReports,
        verifiedReports,
        highRiskReports,
        criticalReports,
        resolvedReports,
        todayReports,
        weekReports,
        categoryStats,
        riskStats,
        statusStats,
        trendStats,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
