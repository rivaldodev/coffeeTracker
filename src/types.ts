export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DrinkRecord {
  id: number;
  userId: number;
  consumedAt: string;
  drink?: string | number; // Field for drink type or ML
  amountMl?: number; // Optional
}

export interface RankingEntry {
  userId: number;
  userName: string;
  totalDrinks: number;
}

// Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK === 'true'; // Default to false, only true if explicitly set to 'true'

// Helper to get auth header
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
