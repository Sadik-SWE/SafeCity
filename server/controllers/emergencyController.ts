import { Request, Response } from 'express';
import { dbStore } from '../db/store';

export const getEmergencyServices = async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;
    let services = await dbStore.getEmergencyServices();

    if (type && type !== 'ALL') {
      services = services.filter(s => s.type === type);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      services = services.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: services.length, services });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createEmergencyService = async (req: Request, res: Response) => {
  try {
    const { name, type, address, phone, latitude, longitude, available24x7 } = req.body;

    if (!name || !type || !address || !phone) {
      return res.status(400).json({ success: false, message: 'Name, type, address, and phone are required.' });
    }

    const service = await dbStore.createEmergencyService({
      name,
      type,
      address,
      phone,
      latitude: latitude ? parseFloat(latitude) : 23.8103,
      longitude: longitude ? parseFloat(longitude) : 90.4125,
      available24x7: available24x7 !== undefined ? Boolean(available24x7) : true,
    });

    res.status(201).json({ success: true, message: 'Emergency service added', service });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmergencyService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await dbStore.updateEmergencyService(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, message: 'Emergency service updated', service: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEmergencyService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbStore.deleteEmergencyService(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, message: 'Emergency service deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
