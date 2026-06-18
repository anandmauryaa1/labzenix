import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CrmTask from '@/models/CrmTask';
import CrmNotification from '@/models/CrmNotification';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['Pending', 'Completed', 'Overdue']).default('Pending'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  contact: z.string().optional().nullable(),
  deal: z.string().optional().nullable(),
});

// GET: Tasks
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const contactId = searchParams.get('contactId') || '';

    const query: any = {};
    
    // Non-admins see their own tasks
    if (user.role !== 'admin') {
      query.assignedTo = user.id;
    }
    
    if (status) {
      query.status = status;
    }
    if (contactId) {
      query.contact = contactId;
    }

    const tasks = await CrmTask.find(query)
      .populate('contact', 'name company email')
      .populate('deal', 'title value')
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 });

    logger.info('CRM Tasks retrieved', { count: tasks.length, userId: user.id });
    return NextResponse.json(tasks);
  } catch (err) {
    return handleProductionError(err);
  }
}

// POST: Create Task
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const result = taskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const taskData = {
      ...result.data,
      dueDate: new Date(result.data.dueDate),
      assignedTo: user.id,
      contact: result.data.contact || undefined,
      deal: result.data.deal || undefined,
    };

    const newTask = await CrmTask.create(taskData);
    logger.info('CRM Task created', { taskId: newTask._id, assignedTo: user.id });

    // Send instant notification for new high-priority tasks
    if (newTask.priority === 'High') {
      await CrmNotification.create({
        userId: user.id,
        title: 'New High Priority Task ⚡',
        message: `High priority task "${newTask.title}" is due by ${new Date(newTask.dueDate).toLocaleDateString()}.`,
        type: 'Task',
      });
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    return handleProductionError(err);
  }
}

// PUT: Update Task
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

    const validated = taskSchema.partial().safeParse(updateData);
    if (!validated.success) {
      return NextResponse.json({ error: 'Validation failed', details: validated.error.format() }, { status: 400 });
    }

    const parsedUpdate: any = { ...validated.data };
    if (validated.data.dueDate) {
      parsedUpdate.dueDate = new Date(validated.data.dueDate);
    }

    const updatedTask = await CrmTask.findByIdAndUpdate(id, parsedUpdate, { new: true })
      .populate('contact', 'name company email')
      .populate('deal', 'title value')
      .populate('assignedTo', 'name');

    if (!updatedTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    logger.info('CRM Task updated', { taskId: id, updatedBy: user.id });
    return NextResponse.json(updatedTask);
  } catch (err) {
    return handleProductionError(err);
  }
}

// DELETE: Delete Task
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

    const task = await CrmTask.findByIdAndDelete(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    logger.info('CRM Task deleted', { taskId: id, deletedBy: user.id });
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (err) {
    return handleProductionError(err);
  }
}
