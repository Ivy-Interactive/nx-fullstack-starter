export interface Item {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateItemDto {
  title: string;
  description?: string;
}

export interface UpdateItemDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface DbServiceHealth {
  service: string;
  status: string;
  port: number;
  database: 'connected' | 'disconnected';
  timestamp: string;
  uptime: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  port: number;
  database: 'connected' | 'disconnected';
  dbService?: DbServiceHealth;
}
