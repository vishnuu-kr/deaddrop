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
      dead_drops: {
        Row: {
          id: string;
          encrypted_payload: string;
          iv: string;
          auth_tag: string | null;
          target_location: string; // PostGIS Geography point
          unlock_radius: number;
          created_at: string;
          expires_at: string;
          is_burned: boolean;
          burn_count: number;
        };
        Insert: {
          id?: string;
          encrypted_payload: string;
          iv: string;
          auth_tag?: string | null;
          target_location: string;
          unlock_radius: number;
          created_at?: string;
          expires_at?: string;
          is_burned?: boolean;
          burn_count?: number;
        };
        Update: {
          id?: string;
          encrypted_payload?: string;
          iv?: string;
          auth_tag?: string | null;
          target_location?: string;
          unlock_radius?: number;
          created_at?: string;
          expires_at?: string;
          is_burned?: boolean;
          burn_count?: number;
        };
      };
    };
    Views: {};
    Functions: {
      find_nearby_drops: {
        Args: {
          user_longitude: number;
          user_latitude: number;
          search_radius_meters?: number;
        };
        Returns: {
          id: string;
          target_longitude: number;
          target_latitude: number;
          unlock_radius: number;
          distance_meters: number;
          created_at: string;
          expires_at: string;
          is_burned: boolean;
        }[];
      };
      validate_proximity: {
        Args: {
          drop_id: string;
          user_longitude: number;
          user_latitude: number;
        };
        Returns: {
          is_within_radius: boolean;
          distance_meters: number;
          required_radius: number;
          is_active: boolean;
        }[];
      };
      burn_drop: {
        Args: {
          drop_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {};
  };
}

export interface DeadDrop {
  id: string;
  target_latitude: number;
  target_longitude: number;
  unlock_radius: number;
  distance_meters?: number;
  created_at: string;
  expires_at: string;
  is_burned: boolean;
}

export interface BurnerLink {
  dropId: string;
  keyString: string; // Stored in URL hash, never sent to server
}
