export interface Recommendation {
  id: string;
  /** Destinataire (`all` pour une recommandation diffusée à tous). */
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  readAt: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}
