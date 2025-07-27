
import { createApiService } from '@/shared/lib/admin/admin-generator';
import { API_ENDPOINTS } from '@/shared/config/api';

const base = API_ENDPOINTS.category.base;

export const categoryService = {
	...createApiService(base),
	async restore(id: string) {
		const res = await fetch(`${base}/${id}/restore`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		if (!res.ok) throw new Error('Erreur lors de la restauration');
		return res.json(); 
	},
	async softDelete(id: string) {
		const res = await fetch(`${base}/${id}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		});
		if (!res.ok) throw new Error('Erreur lors de la suppression');
		return res.json();
	}
};
