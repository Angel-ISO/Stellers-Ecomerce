import RestServices from '../RestServices';

global.fetch = jest.fn();

describe('RestServices', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.clear();
	});

	describe('GET requests', () => {
		it('should make successful GET request', async () => {
			const mockData = { id: 1, name: 'Test' };
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockData
			});

			const result = await RestServices.get('https://api.test.com/data');

			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.test.com/data',
				expect.objectContaining({
					headers: expect.objectContaining({
						'Content-Type': 'application/json'
					})
				})
			);
			expect(result).toEqual(mockData);
		});

		it('should include auth token in headers when available', async () => {
			localStorage.setItem('auth_token', 'test-token');
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => ({})
			});

			await RestServices.get('https://api.test.com/data');

			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.test.com/data',
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'Bearer test-token'
					})
				})
			);
		});

		it('should throw error on failed GET request', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => JSON.stringify({ message: 'Not found' })
			});

			await expect(RestServices.get('https://api.test.com/data')).rejects.toThrow('Not found');
		});
	});

	describe('POST requests', () => {
		it('should make successful POST request', async () => {
			const mockData = { id: 1, name: 'Created' };
			const postData = { name: 'New Item' };

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockData
			});

			const result = await RestServices.post('https://api.test.com/data', postData);

			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.test.com/data',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(postData),
					headers: expect.objectContaining({
						'Content-Type': 'application/json'
					})
				})
			);
			expect(result).toEqual(mockData);
		});

		it('should throw error on failed POST request', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => JSON.stringify({ message: 'Validation error' })
			});

			await expect(RestServices.post('https://api.test.com/data', {})).rejects.toThrow(
				'Validation error'
			);
		});

		it('should log and throw when POST returns non-JSON error', async () => {
			const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => 'Plain text error from POST'
			});

			await expect(RestServices.post('https://api.test.com/data', {})).rejects.toThrow(
				'Plain text error from POST'
			);

			expect(errorSpy).toHaveBeenCalledWith('Plain text error from POST');
			errorSpy.mockRestore();
		});
	});

	describe('PUT requests', () => {
		it('should make successful PUT request', async () => {
			const mockData = { id: 1, name: 'Updated' };
			const putData = { name: 'Updated Item' };

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockData
			});

			const result = await RestServices.put('https://api.test.com/data/1', putData);

			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.test.com/data/1',
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify(putData)
				})
			);
			expect(result).toEqual(mockData);
		});

		it('should throw error on failed PUT request', async () => {
			jest.spyOn(console, 'error').mockImplementation(() => {});
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => 'Update failed'
			});

			await expect(RestServices.put('https://api.test.com/data/1', {})).rejects.toThrow(
				'Update failed'
			);
		});

		it('should throw error on failed PUT request with JSON error', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => JSON.stringify({ message: 'Update validation error' })
			});

			await expect(RestServices.put('https://api.test.com/data/1', {})).rejects.toThrow(
				'Update validation error'
			);
		});
	});

	describe('PATCH requests', () => {
		it('should make successful PATCH request', async () => {
			const mockData = { id: 1, status: 'active' };
			const patchData = { status: 'active' };

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockData
			});

			const result = await RestServices.patch('https://api.test.com/data/1', patchData);

			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.test.com/data/1',
				expect.objectContaining({
					method: 'PATCH',
					body: JSON.stringify(patchData)
				})
			);
			expect(result).toEqual(mockData);
		});

		it('should throw error on failed PATCH request with JSON error', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => JSON.stringify({ message: 'Patch failed' })
			});

			await expect(RestServices.patch('https://api.test.com/data/1', {})).rejects.toThrow(
				'Patch failed'
			);
		});

		it('should throw error on failed PATCH request with plain text', async () => {
			jest.spyOn(console, 'error').mockImplementation(() => {});
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => 'Patch error'
			});

			await expect(RestServices.patch('https://api.test.com/data/1', {})).rejects.toThrow(
				'Patch error'
			);
		});
	});

	describe('DELETE requests', () => {
		it('should make successful DELETE request', async () => {
			const mockData = { success: true };

			(global.fetch as jest.Mock).mockResolvedValue({
				ok: true,
				json: async () => mockData
			});

			const result = await RestServices.delete('https://api.test.com/data/1');

			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.test.com/data/1',
				expect.objectContaining({
					method: 'DELETE'
				})
			);
			expect(result).toEqual(mockData);
		});

		it('should throw error on failed DELETE request', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => JSON.stringify({ message: 'Delete failed' })
			});

			await expect(RestServices.delete('https://api.test.com/data/1')).rejects.toThrow(
				'Delete failed'
			);
		});

		it('should throw error on failed DELETE request with plain text', async () => {
			jest.spyOn(console, 'error').mockImplementation(() => {});
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => 'Delete error'
			});

			await expect(RestServices.delete('https://api.test.com/data/1')).rejects.toThrow(
				'Delete error'
			);
		});
	});

	describe('Error handling', () => {
		it('should handle non-JSON error responses', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => 'Plain text error'
			});

			await expect(RestServices.get('https://api.test.com/data')).rejects.toThrow(
				'Plain text error'
			);
		});

		it('should handle malformed JSON in error response', async () => {
			(global.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				text: async () => '{ invalid json'
			});

			await expect(RestServices.get('https://api.test.com/data')).rejects.toThrow('{ invalid json');
		});
	});

	it('should merge custom headers with defaults', async () => {
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({})
		});

		await RestServices.get('https://api.test.com/data', {
			headers: {
				'X-Custom': 'yes'
			}
		});

		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.test.com/data',
			expect.objectContaining({
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
					'X-Custom': 'yes'
				})
			})
		);
	});
});
