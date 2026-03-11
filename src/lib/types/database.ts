export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					email: string;
					display_name: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					email: string;
					display_name?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					display_name?: string | null;
					updated_at?: string;
				};
			};
			user_profile: {
				Row: {
					id: string;
					user_id: string;
					profile_text: string | null;
					energy_level: number | null;
					social_context: string | null;
					penalty_flags: string[];
					active_categories: string[];
					home_neighborhood: string | null;
					onboarding_done: boolean;
					onboarding_answers: Json | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					profile_text?: string | null;
					energy_level?: number | null;
					social_context?: string | null;
					penalty_flags?: string[];
					active_categories?: string[];
					home_neighborhood?: string | null;
					onboarding_done?: boolean;
					onboarding_answers?: Json | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					profile_text?: string | null;
					energy_level?: number | null;
					social_context?: string | null;
					penalty_flags?: string[];
					active_categories?: string[];
					home_neighborhood?: string | null;
					onboarding_done?: boolean;
					onboarding_answers?: Json | null;
					updated_at?: string;
				};
			};
			conversations: {
				Row: {
					id: string;
					user_id: string;
					title: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					title?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					title?: string | null;
					updated_at?: string;
				};
			};
			messages: {
				Row: {
					id: string;
					conversation_id: string;
					role: "user" | "assistant";
					content: string;
					metadata: Json | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					conversation_id: string;
					role: "user" | "assistant";
					content: string;
					metadata?: Json | null;
					created_at?: string;
				};
				Update: {
					content?: string;
					metadata?: Json | null;
				};
			};
			bookmarks: {
				Row: {
					id: string;
					user_id: string;
					message_id: string | null;
					name: string;
					category: string | null;
					address: string | null;
					notes: string | null;
					url: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					message_id?: string | null;
					name: string;
					category?: string | null;
					address?: string | null;
					notes?: string | null;
					url?: string | null;
					created_at?: string;
				};
				Update: {
					name?: string;
					category?: string | null;
					address?: string | null;
					notes?: string | null;
					url?: string | null;
				};
			};
			feed_cache: {
				Row: {
					id: string;
					user_id: string;
					items: Json;
					category: string;
					generated_at: string;
					expires_at: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					items: Json;
					category?: string;
					generated_at?: string;
					expires_at: string;
					created_at?: string;
				};
				Update: {
					items?: Json;
					expires_at?: string;
				};
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}
