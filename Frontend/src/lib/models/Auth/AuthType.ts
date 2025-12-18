export interface Login {
	email: string;
	password: string;
}

export interface Register {
	email: string;
	password: string;
	displayName: string;
	bio?: string;
}

export interface LoginSupabase {
	supabaseAccessToken: string;
}

export interface UserOutput {
	id: string;
	name: string;
	email: string;
	avatarUrl?: string;
	isVerified: boolean;
	isModerator?: boolean;
	isSeller?: boolean;
	isBanned?: boolean;
	roles?: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface AuthPayload {
	user: UserOutput;
	token: string;
	supabaseAccessToken?: string;
}

export interface AuthError {
	message: string;
	code?: string;
	field?: string;
}

export interface ValidationErrors {
	email?: string;
	password?: string;
	displayName?: string;
	confirmPassword?: string;
	bio?: string;
}