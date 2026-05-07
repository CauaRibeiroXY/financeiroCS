import useSWR from 'swr';
import { api } from '@/app/lib/utils/api';

export interface Category {
    id: string;
    name: string;
    created_at: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useCategories() {
    const { data, error, isLoading, mutate } = useSWR<Category[]>('/api/categories', fetcher);

    const addCategory = async (name: string) => {
        try {
            const response = await api.post('/api/categories', { name });
            // Optimistic update
            mutate([...(data || []), response.data], false);
            // Revalidate to ensure server state
            mutate();
            return { success: true, data: response.data };
        } catch (err: any) {
            console.error('Error adding category:', err);
            throw new Error(err.response?.data?.error || 'Failed to add category');
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            await api.delete(`/api/categories/${id}`);
            // Optimistic update
            mutate((data || []).filter(c => c.id !== id), false);
            // Revalidate
            mutate();
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting category:', err);
            throw new Error(err.response?.data?.error || 'Failed to delete category');
        }
    };

    return {
        categories: data || [],
        isLoading,
        isError: !!error,
        addCategory,
        deleteCategory,
        mutate
    };
}
