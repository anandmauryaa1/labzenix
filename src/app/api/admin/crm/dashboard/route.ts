import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Lead from '@/models/Lead';
import CrmTask from '@/models/CrmTask';
import Activity from '@/models/Activity';
import ServiceTicket from '@/models/ServiceTicket';
import AMCRecord from '@/models/AMCRecord';
import Quotation from '@/models/Quotation';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    // Parallel count operations
    const [
      totalLeads,
      newLeads,
      openOpportunities,
      quotationsSent,
      ordersWon,
      pendingFollowups,
      openServiceTickets,
      amcExpiringSoon,
      recentActivities,
      monthlyDealsAggregate
    ] = await Promise.all([
      // Total Leads
      Lead.countDocuments({}),
      // New Leads
      Lead.countDocuments({ stage: 'New' }),
      // Open Opportunities (stage not Won or Lost)
      Lead.countDocuments({ stage: { $nin: ['Won', 'Lost'] } }),
      // Quotations Sent status
      Quotation.countDocuments({ status: 'Sent' }),
      // Orders Won count
      Lead.countDocuments({ stage: 'Won' }),
      // Pending Followups (Pending tasks)
      CrmTask.countDocuments({ status: 'Pending' }),
      // Open Service Tickets
      ServiceTicket.countDocuments({ status: 'Open' }),
      // AMC Records calibration due in next 30 days
      AMCRecord.countDocuments({
        calibrationDueDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      }),
      // Recent B2B Activities (Timeline logs)
      Activity.find({})
        .populate('company', 'name')
        .populate('createdBy', 'name')
        .sort({ date: -1 })
        .limit(6),
      // Monthly Deal value aggregates
      Lead.aggregate([
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            value: { $sum: '$budget' }
          }
        }
      ])
    ]);

    // Parse deals pipeline stats
    let totalRevenue = 0;
    const salesPipeline: Record<string, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      'Demo Scheduled': 0,
      'Quotation Sent': 0,
      Negotiation: 0,
      Won: 0,
      Lost: 0
    };

    monthlyDealsAggregate.forEach((item: any) => {
      if (item._id === 'Won') {
        totalRevenue = item.value;
      }
      if (salesPipeline[item._id] !== undefined) {
        salesPipeline[item._id] = item.value;
      }
    });

    const payload = {
      kpis: {
        totalLeads,
        newLeads,
        openOpportunities,
        quotationsSent,
        ordersWon,
        monthlyRevenue: totalRevenue,
        pendingFollowups,
        openServiceTickets,
        amcExpiringSoon
      },
      salesPipeline,
      recentActivities
    };

    return NextResponse.json(payload);
  } catch (err) {
    return handleProductionError(err);
  }
}
