// Set EXPO_PUBLIC_API_URL in mobile/.env for your device or simulator.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:4000';

// Names the backend uses. Change here if yours differ.
export const LEADS_PATH = '/api/leads';
export const NEW_LEAD_EVENT = 'new_lead';
