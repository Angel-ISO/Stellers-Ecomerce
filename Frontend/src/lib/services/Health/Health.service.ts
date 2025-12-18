import config from '$lib/config/env';


export const checkSystemHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${config.backendUrl}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.status === 200;
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
};
