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
    } catch (error: unknown) {
        console.error('Error categorizing all transactions:', error);
        const message = error instanceof Error ? error.message : 'Erro ao categorizar transações';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
