import { NextResponse } from 'next/server';
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/app/lib/services/goals';
import { withErrorHandling } from '@/app/lib/utils/error-handler';

async function getHandler() {
  const goals = await getGoals();
  return NextResponse.json(goals);
}

async function postHandler(request: Request) {
  const body = await request.json();
  const newGoal = await createGoal(body);
  return NextResponse.json(newGoal, { status: 201 });
}

async function putHandler(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  
  if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  
  const updatedGoal = await updateGoal(id, updates);
  return NextResponse.json(updatedGoal);
}

async function deleteHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  
  await deleteGoal(Number(id));
  return new NextResponse(null, { status: 204 });
}

export const GET = withErrorHandling(getHandler);
export const POST = withErrorHandling(postHandler);
export const PUT = withErrorHandling(putHandler);
export const DELETE = withErrorHandling(deleteHandler);