import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CrmContact from '@/models/CrmContact';
import CrmDeal from '@/models/CrmDeal';
import CrmActivity from '@/models/CrmActivity';
import CrmTask from '@/models/CrmTask';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    // Today boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Run dashboard aggregate queries in parallel
    const [
      totalContacts,
      leadsCount,
      customersCount,
      dealsSummary,
      tasksSummary,
      dailyStats,
      activityCounts,
      recentActivities
    ] = await Promise.all([
      // Total contacts count
      CrmContact.countDocuments({}),
      
      // Leads count
      CrmContact.countDocuments({ status: 'Lead' }),
      
      // Customers count
      CrmContact.countDocuments({ status: 'Customer' }),

      // Deals Summary (Funnel aggregation + values)
      CrmDeal.aggregate([
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            totalValue: { $sum: '$value' }
          }
        }
      ]),

      // Tasks Status count
      CrmTask.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Daily Updates Metrics
      Promise.all([
        CrmContact.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
        CrmDeal.countDocuments({ updatedAt: { $gte: startOfToday, $lte: endOfToday } }),
        CrmTask.countDocuments({ 
          dueDate: { $gte: startOfToday, $lte: endOfToday },
          status: 'Pending'
        }),
        CrmActivity.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } })
      ]),

      // Activity counts by type
      CrmActivity.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalDuration: { $sum: { $ifNull: ['$duration', 0] } }
          }
        }
      ]),

      // Recent Activity timeline (last 5)
      CrmActivity.find({})
        .populate('contact', 'name company')
        .populate('createdBy', 'name')
        .sort({ date: -1 })
        .limit(5)
    ]);

    // Parse deals summary
    let openDealsValue = 0;
    let wonDealsValue = 0;
    let totalDealsCount = 0;
    let wonDealsCount = 0;
    const funnel: Record<string, { count: number; value: number }> = {
      Lead: { count: 0, value: 0 },
      Qualification: { count: 0, value: 0 },
      Proposal: { count: 0, value: 0 },
      Negotiation: { count: 0, value: 0 },
      Won: { count: 0, value: 0 },
      Lost: { count: 0, value: 0 }
    };

    dealsSummary.forEach(item => {
      totalDealsCount += item.count;
      if (item._id === 'Won') {
        wonDealsValue = item.totalValue;
        wonDealsCount = item.count;
      } else if (item._id !== 'Lost') {
        openDealsValue += item.totalValue;
      }
      if (funnel[item._id]) {
        funnel[item._id] = { count: item.count, value: item.totalValue };
      }
    });

    const conversionRate = totalDealsCount > 0 ? (wonDealsCount / totalDealsCount) * 100 : 0;

    // Parse tasks summary
    const tasks: Record<string, number> = { Pending: 0, Completed: 0, Overdue: 0 };
    tasksSummary.forEach(item => {
      if (tasks[item._id] !== undefined) {
        tasks[item._id] = item.count;
      }
    });

    // Parse activities summary
    const activities: Record<string, { count: number; duration?: number }> = {
      Call: { count: 0, duration: 0 },
      Email: { count: 0 },
      Meeting: { count: 0 },
      Note: { count: 0 }
    };
    activityCounts.forEach(item => {
      if (activities[item._id]) {
        activities[item._id].count = item.count;
        if (item._id === 'Call') {
          activities.Call.duration = item.totalDuration;
        }
      }
    });

    const payload = {
      metrics: {
        totalContacts,
        leadsCount,
        customersCount,
        openDealsValue,
        wonDealsValue,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        pendingTasks: tasks.Pending,
        completedTasks: tasks.Completed,
        overdueTasks: tasks.Overdue,
      },
      dailyUpdates: {
        newLeadsToday: dailyStats[0],
        dealsUpdatedToday: dailyStats[1],
        tasksDueToday: dailyStats[2],
        activitiesLoggedToday: dailyStats[3]
      },
      funnel,
      activities,
      recentActivities
    };

    return NextResponse.json(payload);
  } catch (err) {
    return handleProductionError(err);
  }
}
