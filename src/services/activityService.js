// src/services/activityService.js
// Admin activity log service.

import { storage } from './storageService.js';

export function logActivity(userId, action, description) {
  const logs = storage.get('activityLogs') || [];
  logs.unshift({
    id: `log-${Date.now()}`,
    userId,
    action,
    description,
    timestamp: new Date().toISOString(),
  });
  // Keep last 200 logs
  if (logs.length > 200) logs.splice(200);
  storage.set('activityLogs', logs);
}

export function getActivityLogs(limit = 50) {
  return (storage.get('activityLogs') || []).slice(0, limit);
}
