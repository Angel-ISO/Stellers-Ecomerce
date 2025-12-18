import RestServices from '../RestServices';
import type { Store } from '$lib/models/Store/StoreType';
import { config } from '$lib/config/env';

class StoreService {
	private baseUrl = `${config.backendUrl}/stores`;

	public async getStore(id: string): Promise<Store> {
		return RestServices.get<Store>(`${this.baseUrl}/${id}`);
	}
}

export default new StoreService();
