import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Lead from '@/models/Lead';
import CrmTask from '@/models/CrmTask';
import CrmContact from '@/models/CrmContact';
import CrmActivity from '@/models/CrmActivity';
import Activity from '@/models/Activity';
import ServiceTicket from '@/models/ServiceTicket';
import AMCRecord from '@/models/AMCRecord';
import Quotation from '@/models/Quotation';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const endOfYesterday = new Date(startOfToday.getTime() - 1);

    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const endOfTomorrow = new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000 - 1);

    const next14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Parallel queries
    const [
      // Today's leads count
      todayLeadsLeadCount,
      todayLeadsContactCount,
      yesterdayLeadsCount,
      completedLeadsCount,

      // Followups
      todayFollowupsCount,
      completedFollowupsCount,

      // Tasks
      todayTasksCount,
      completedTasksTodayCount,
      tomorrowTasksCount,

      // Tasks for To-Dos categorized by priority
      todayTodosCount,
      highTodosCount,
      medTodosCount,
      lowTodosCount,
      completedTodosCount,

      // Leads tab lists
      newLeadsList,
      processingLeadsList,
      closeByLeadsList,

      // Schedules lists
      remindersList,
      meetingsList,
      eventsList,

      // Tasks lists
      todayTasksList,
      tomorrowTasksList,

      // To-Dos lists
      highTodosList,
      medTodosList,
      lowTodosList
    ] = await Promise.all([
      // 1. Leads counts
      Lead.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
      CrmContact.countDocuments({ status: 'Lead', createdAt: { $gte: startOfToday, $lte: endOfToday } }),
      Lead.countDocuments({ createdAt: { $gte: startOfYesterday, $lte: endOfYesterday } }),
      Lead.countDocuments({ stage: 'Won', updatedAt: { $gte: startOfToday, $lte: endOfToday } }),

      // 2. Followups counts (Activities or tasks with follow-up)
      CrmActivity.countDocuments({ 
        type: { $in: ['Call', 'Email'] },
        date: { $gte: startOfToday, $lte: endOfToday } 
      }),
      CrmActivity.countDocuments({ 
        status: 'Completed',
        date: { $gte: startOfToday, $lte: endOfToday } 
      }),

      // 3. Tasks counts
      CrmTask.countDocuments({ dueDate: { $gte: startOfToday, $lte: endOfToday } }),
      CrmTask.countDocuments({ status: 'Completed', dueDate: { $gte: startOfToday, $lte: endOfToday } }),
      CrmTask.countDocuments({ dueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow } }),

      // 4. To-Dos counts
      CrmTask.countDocuments({ 
        $or: [
          { dueDate: { $gte: startOfToday, $lte: endOfToday } },
          { createdAt: { $gte: startOfToday, $lte: endOfToday } }
        ],
        status: 'Pending'
      }),
      CrmTask.countDocuments({ priority: 'High', status: 'Pending' }),
      CrmTask.countDocuments({ priority: 'Medium', status: 'Pending' }),
      CrmTask.countDocuments({ priority: 'Low', status: 'Pending' }),
      CrmTask.countDocuments({ 
        $or: [
          { dueDate: { $gte: startOfToday, $lte: endOfToday } },
          { updatedAt: { $gte: startOfToday, $lte: endOfToday } }
        ],
        status: 'Completed' 
      }),

      // 5. Leads tab lists (Limit 15 each)
      Lead.find({ stage: 'New' })
        .populate('company', 'name')
        .populate('contactPerson', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      Lead.find({ stage: { $in: ['Contacted', 'Qualified', 'Negotiation', 'Demo Scheduled'] } })
        .populate('company', 'name')
        .populate('contactPerson', 'name email phone')
        .sort({ updatedAt: -1 })
        .limit(15)
        .lean(),
      Lead.find({ 
        expectedClosingDate: { $gte: now, $lte: next14Days },
        stage: { $nin: ['Won', 'Lost'] }
      })
        .populate('company', 'name')
        .populate('contactPerson', 'name email phone')
        .sort({ expectedClosingDate: 1 })
        .limit(15)
        .lean(),

      // 6. Schedules lists
      CrmTask.find({ 
        priority: 'High', 
        status: 'Pending',
        dueDate: { $gte: startOfToday }
      })
        .populate('contact', 'name company email')
        .sort({ dueDate: 1 })
        .limit(15)
        .lean(),
      CrmActivity.find({ 
        type: 'Meeting',
        date: { $gte: startOfToday }
      })
        .populate('contact', 'name company email')
        .sort({ date: 1 })
        .limit(15)
        .lean(),
      CrmActivity.find({
        type: { $in: ['Call', 'Note'] },
        date: { $gte: startOfToday }
      })
        .populate('contact', 'name company email')
        .sort({ date: 1 })
        .limit(15)
        .lean(),

      // 7. Tasks lists
      CrmTask.find({ dueDate: { $gte: startOfToday, $lte: endOfToday } })
        .populate('contact', 'name company email')
        .sort({ priority: -1, dueDate: 1 })
        .limit(15)
        .lean(),
      CrmTask.find({ dueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow } })
        .populate('contact', 'name company email')
        .sort({ priority: -1, dueDate: 1 })
        .limit(15)
        .lean(),

      // 8. To-Dos lists
      CrmTask.find({ priority: 'High', status: 'Pending' })
        .populate('contact', 'name company email')
        .sort({ dueDate: 1 })
        .limit(15)
        .lean(),
      CrmTask.find({ priority: 'Medium', status: 'Pending' })
        .populate('contact', 'name company email')
        .sort({ dueDate: 1 })
        .limit(15)
        .lean(),
      CrmTask.find({ priority: 'Low', status: 'Pending' })
        .populate('contact', 'name company email')
        .sort({ dueDate: 1 })
        .limit(15)
        .lean()
    ]);

    // Format metrics
    const totalTodayLeads = todayLeadsLeadCount + todayLeadsContactCount;
    let leadsVsYesterdayPercent = '0.00 % Increase';
    if (yesterdayLeadsCount === 0) {
      leadsVsYesterdayPercent = totalTodayLeads > 0 ? '+100.00 % Increase' : '0.00 % Increase';
    } else {
      const diff = ((totalTodayLeads - yesterdayLeadsCount) / yesterdayLeadsCount) * 100;
      leadsVsYesterdayPercent = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} % ${diff >= 0 ? 'Increase' : 'Decrease'}`;
    }

    const payload = {
      kpiCards: {
        todayLeads: {
          count: totalTodayLeads,
          vsYesterdayBadge: leadsVsYesterdayPercent,
          completedCount: completedLeadsCount,
          completedPercent: '100.00 %'
        },
        todayFollowups: {
          count: todayFollowupsCount,
          completedCount: completedFollowupsCount,
          completedPercent: '100.00 %'
        },
        todayTasks: {
          count: todayTasksCount,
          completedCount: completedTasksTodayCount,
          completedPercent: '100.00 %'
        },
        todayTodos: {
          count: todayTodosCount,
          completedCount: completedTodosCount,
          completedPercent: '100.00 %'
        }
      },
      leads: {
        new: { count: newLeadsList.length, items: newLeadsList },
        processing: { count: processingLeadsList.length, items: processingLeadsList },
        closeBy: { count: closeByLeadsList.length, items: closeByLeadsList }
      },
      schedules: {
        reminder: { count: remindersList.length, items: remindersList },
        meeting: { count: meetingsList.length, items: meetingsList },
        events: { count: eventsList.length, items: eventsList }
      },
      tasks: {
        today: { count: todayTasksList.length, items: todayTasksList },
        tomorrow: { count: tomorrowTasksList.length, items: tomorrowTasksList }
      },
      todos: {
        high: { count: highTodosList.length, items: highTodosList },
        medium: { count: medTodosList.length, items: medTodosList },
        low: { count: lowTodosList.length, items: lowTodosList }
      }
    };

    return NextResponse.json(payload);
  } catch (err) {
    return handleProductionError(err);
  }
}
