import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AMCRecord from '@/models/AMCRecord';
import CrmNotification from '@/models/CrmNotification';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const amcSchema = z.object({
  company: z.string().min(1, 'Company ID is required'),
  machineSerialNumber: z.string().min(1, 'Serial number is required').trim(),
  productName: z.string().min(1, 'Product name is required').trim(),
  installationDate: z.string(),
  warrantyExpiryDate: z.string(),
  amcStartDate: z.string().optional(),
  amcEndDate: z.string().optional(),
  calibrationDueDate: z.string(),
});

// GET: Retrieve AMC schedules and alerts
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || ''; // 'expiring' or 'all'

    const query: any = {};
    if (filter === 'expiring') {
      // Find calibrations due in the next 30 days
      query.calibrationDueDate = { 
        $gte: new Date(), 
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      };
    }

    const records = await AMCRecord.find(query)
      .populate('company', 'name website address')
      .sort({ calibrationDueDate: 1 });

    // Automated Alert Evaluation (System Cron simulator)
    // Run an inline check of dates and generate alerts
    const now = new Date();
    const alertsToTrigger = records.filter(rec => {
      const diffTime = rec.calibrationDueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let alertTriggered = false;
      if (diffDays <= 7 && !rec.alert7Sent) {
        rec.alert7Sent = true;
        alertTriggered = true;
      } else if (diffDays <= 15 && !rec.alert15Sent) {
        rec.alert15Sent = true;
        alertTriggered = true;
      } else if (diffDays <= 30 && !rec.alert30Sent) {
        rec.alert30Sent = true;
        alertTriggered = true;
      }
      return alertTriggered;
    });

    if (alertsToTrigger.length > 0) {
      await Promise.all(alertsToTrigger.map(async rec => {
        const diffTime = rec.calibrationDueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        await Promise.all([
          rec.save(),
          CrmNotification.create({
            userId: user.id,
            title: `Calibration Expiring: ${rec.machineSerialNumber} ⚠️`,
            message: `Machine "${rec.productName}" serial ${rec.machineSerialNumber} is due for calibration in ${diffDays} days.`,
            type: 'CallSchedule'
          })
        ]);
      }));
      logger.info('AMC Calibration alerts evaluated and dispatched', { count: alertsToTrigger.length });
    }

    return NextResponse.json(records);
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Register machine calibration log
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const result = amcSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const payload = {
      ...result.data,
      installationDate: new Date(result.data.installationDate),
      warrantyExpiryDate: new Date(result.data.warrantyExpiryDate),
      amcStartDate: result.data.amcStartDate ? new Date(result.data.amcStartDate) : undefined,
      amcEndDate: result.data.amcEndDate ? new Date(result.data.amcEndDate) : undefined,
      calibrationDueDate: new Date(result.data.calibrationDueDate),
    };

    const newRecord = await AMCRecord.create(payload);
    logger.info('AMC Record registered', { recordId: newRecord._id });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}
