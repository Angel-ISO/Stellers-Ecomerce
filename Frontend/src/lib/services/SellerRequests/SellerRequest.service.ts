import RestServices from '$lib/services/RestServices';
import type { SellerRequest, CreateSellerRequestInput } from '$lib/models/SellerRequests/SellerRequestType';
import { config } from '$lib/config/env';

class SellerRequestService {
	private readonly baseUrl = config.backendUrl;

	public async createRequest(input: CreateSellerRequestInput): Promise<SellerRequest> {
		return RestServices.post<SellerRequest>(`${this.baseUrl}/seller-requests`, input);
	}

	public async getPendingRequests(): Promise<SellerRequest[]> {
		return RestServices.get<SellerRequest[]>(`${this.baseUrl}/seller-requests/pending`);
	}

	public async getMyRequest(): Promise<SellerRequest | null> {
		return RestServices.get<SellerRequest | null>(`${this.baseUrl}/seller-requests/my-request`);
	}

	public async approveRequest(id: string): Promise<void> {
		return RestServices.post<void>(`${this.baseUrl}/seller-requests/${id}/approve`, {});
	}

	public async rejectRequest(id: string): Promise<void> {
		return RestServices.post<void>(`${this.baseUrl}/seller-requests/${id}/reject`, {});
	}
}

const sellerRequestService = new SellerRequestService();
export default sellerRequestService;

