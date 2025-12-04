// 简单的事件总线实现，用于组件间通信
type EventHandler = (...args: any[]) => void;

class EventBus {
  private events: Record<string, EventHandler[]> = {};

  // 订阅事件
  on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  // 取消订阅
  off(event: string, handler: EventHandler): void {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  // 触发事件
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;

    this.events[event].forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  // 只订阅一次
  once(event: string, handler: EventHandler): void {
    const onceHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }
}

// 创建全局事件总线实例
export const eventBus = new EventBus();

// 导出常用事件名称
export const Events = {
  USER_PROFILE_UPDATED: 'user:profile:updated',
  USER_AVATAR_UPDATED: 'user:avatar:updated',
};
