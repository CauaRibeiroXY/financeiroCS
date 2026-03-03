import { NextResponse } from 'next/server';
import { categorizationService } from '@/app/domain/categorization';

export async function POST() {
    try {
        const updatedCount = await categorizationService.processUncategorizedTransactions();

        return NextResponse.json({
            success: true,
            message: 'Batch categorization completed successfully',
            updatedCount
        });
    } catch (error: any) {
        console.error('Error categorizing all transactions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
