import { NextResponse } from 'next/server';
import { getGoalSnapshots } from '@/app/lib/services/goals';
import { withErrorHandling } from '@/app/lib/utils/error-handler';

async function getHandler() {
  const history = await getGoalSnapshots();
  return NextResponse.json(history);
}

export const GET = withErrorHandling(getHandler);