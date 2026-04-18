import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// GET individual user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    // Authorization check
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const user = await User.findById(id, '-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update user
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    // Authorization check
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { name, email, username, role, password, permissions } = body;

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (name) user.name = name;
    if (email) user.email = email;
    if (username) user.username = username;
    if (role) user.role = role;
    if (password) user.password = password; // Pre-save hook will hash this
    if (permissions) user.permissions = permissions;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    // Authorization check
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Prevent self-deletion
    if (decoded.id === id) {
      return NextResponse.json({ error: 'Self-termination is prohibited for system integrity.' }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ message: 'Personnel access revoked successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
