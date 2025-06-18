// src/utils/notifications.js - Notification management system

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.subscribers = [];
    this.nextId = 1;
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers of changes
  notify() {
    this.subscribers.forEach(callback => {
      callback([...this.notifications]);
    });
  }

  // Add a new notification
  add(notification) {
    const newNotification = {
      id: this.nextId++,
      type: 'info',
      duration: 5000, // 5 seconds default
      timestamp: Date.now(),
      ...notification,
    };

    this.notifications.push(newNotification);
    this.notify();

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  }

  // Remove a notification by ID
  remove(id) {
    this.notifications = this.notifications.filter(
      notification => notification.id !== id
    );
    this.notify();
  }

  // Clear all notifications
  clear() {
    this.notifications = [];
    this.notify();
  }

  // Clear notifications by type
  clearByType(type) {
    this.notifications = this.notifications.filter(
      notification => notification.type !== type
    );
    this.notify();
  }

  // Convenience methods for different notification types
  success(message, title = null, options = {}) {
    return this.add({
      type: 'success',
      message,
      title,
      ...options,
    });
  }

  error(message, title = 'Error', options = {}) {
    return this.add({
      type: 'error',
      message,
      title,
      duration: 0, // Don't auto-dismiss errors
      ...options,
    });
  }

  warning(message, title = 'Warning', options = {}) {
    return this.add({
      type: 'warning',
      message,
      title,
      duration: 7000, // Longer duration for warnings
      ...options,
    });
  }

  info(message, title = null, options = {}) {
    return this.add({
      type: 'info',
      message,
      title,
      ...options,
    });
  }

  // Get all notifications
  getAll() {
    return [...this.notifications];
  }

  // Get notifications by type
  getByType(type) {
    return this.notifications.filter(notification => notification.type === type);
  }

  // Check if there are any notifications of a specific type
  hasType(type) {
    return this.notifications.some(notification => notification.type === type);
  }

  // Get notification count
  getCount() {
    return this.notifications.length;
  }

  // Get count by type
  getCountByType(type) {
    return this.notifications.filter(notification => notification.type === type).length;
  }

  // Stock-specific notification methods
  stockPriceAlert(symbol, price, change, changePercent) {
    const isPositive = change >= 0;
    const message = `${symbol} is now $${price.toFixed(2)} (${isPositive ? '+' : ''}${change.toFixed(2)}, ${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`;
    
    return this.add({
      type: isPositive ? 'success' : 'warning',
      title: 'Price Alert',
      message,
      duration: 8000,
    });
  }

  portfolioUpdate(message, type = 'info') {
    return this.add({
      type,
      title: 'Portfolio Update',
      message,
      duration: 6000,
    });
  }

  tradingAlert(message, type = 'info') {
    return this.add({
      type,
      title: 'Trading Alert',
      message,
      duration: 10000, // Longer for trading alerts
    });
  }

  apiError(message = 'Unable to fetch data. Please try again.') {
    return this.error(message, 'API Error', {
      duration: 0, // Don't auto-dismiss
    });
  }

  connectionError() {
    return this.error(
      'Connection lost. Please check your internet connection.',
      'Connection Error',
      { duration: 0 }
    );
  }

  dataUpdated(entity = 'Data') {
    return this.success(`${entity} updated successfully`, null, {
      duration: 3000,
    });
  }
}

// Create and export a singleton instance
export const notificationManager = new NotificationManager();

// Export the class for testing or creating multiple instances
export default NotificationManager;