import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase/client';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from('categories')
            .insert({ name })
            .select()
            .single();

        if (error) {
            // Handle unique violation or other errors
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
