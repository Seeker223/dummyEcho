/**
 * Data Channels Service for LiveKit
 * Manages real-time data exchange (medical notes, vitals, documents)
 */

import { DataChannelMessage } from '@/lib/types/livekit';

class DataChannelsService {
  private static instance: DataChannelsService;
  private messageQueue: DataChannelMessage[] = [];
  private listeners: Map<string, Set<(message: DataChannelMessage) => void>> = new Map();
  private readonly maxQueueSize = 1000;

  private constructor() {}

  static getInstance(): DataChannelsService {
    if (!DataChannelsService.instance) {
      DataChannelsService.instance = new DataChannelsService();
    }
    return DataChannelsService.instance;
  }

  /**
   * Send a data channel message
   */
  sendMessage(message: DataChannelMessage): void {
    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = Date.now();
    }

    // Queue message
    this.messageQueue.push(message);

    // Maintain queue size
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue = this.messageQueue.slice(-this.maxQueueSize);
    }

    // Notify listeners
    this.notifyListeners(message.type, message);

    console.log(`[DataChannels] Message sent: ${message.type} from ${message.from}`);
  }

  /**
   * Send medical note
   */
  sendMedicalNote(from: string, to: string | undefined, note: string): void {
    this.sendMessage({
      type: 'note',
      from,
      to,
      timestamp: Date.now(),
      payload: { text: note, createdAt: new Date().toISOString() },
    });
  }

  /**
   * Send vital signs
   */
  sendVitals(from: string, vitals: Record<string, number | string>): void {
    this.sendMessage({
      type: 'vital',
      from,
      timestamp: Date.now(),
      payload: {
        ...vitals,
        recordedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Send prescription
   */
  sendPrescription(from: string, to: string | undefined, prescription: Record<string, any>): void {
    this.sendMessage({
      type: 'prescription',
      from,
      to,
      timestamp: Date.now(),
      payload: {
        ...prescription,
        issuedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Send document (reference/metadata, not actual file)
   */
  sendDocument(from: string, to: string | undefined, documentInfo: Record<string, any>): void {
    this.sendMessage({
      type: 'document',
      from,
      to,
      timestamp: Date.now(),
      payload: {
        ...documentInfo,
        sentAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Send image metadata
   */
  sendImage(from: string, to: string | undefined, imageInfo: Record<string, any>): void {
    this.sendMessage({
      type: 'image',
      from,
      to,
      timestamp: Date.now(),
      payload: {
        ...imageInfo,
        sentAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Send chat message
   */
  sendChat(from: string, to: string | undefined, text: string): void {
    this.sendMessage({
      type: 'chat',
      from,
      to,
      timestamp: Date.now(),
      payload: { text },
    });
  }

  /**
   * Send system message
   */
  sendSystemMessage(message: string): void {
    this.sendMessage({
      type: 'system',
      from: 'system',
      timestamp: Date.now(),
      payload: { text: message },
    });
  }

  /**
   * Subscribe to messages of specific type
   */
  subscribe(
    messageType: string,
    listener: (message: DataChannelMessage) => void
  ): () => void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }

    const typeListeners = this.listeners.get(messageType)!;
    typeListeners.add(listener);

    return () => {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        this.listeners.delete(messageType);
      }
    };
  }

  /**
   * Subscribe to all messages
   */
  subscribeAll(listener: (message: DataChannelMessage) => void): () => void {
    const unsubscribers: Array<() => void> = [];

    const types = ['note', 'vital', 'prescription', 'image', 'document', 'chat', 'system'];

    types.forEach((type) => {
      unsubscribers.push(this.subscribe(type, listener));
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(messageType: string, message: DataChannelMessage): void {
    const listeners = this.listeners.get(messageType);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message);
        } catch (error) {
          console.error('[DataChannels] Error in listener:', error);
        }
      });
    }
  }

  /**
   * Get message history
   */
  getMessageHistory(type?: string, limit: number = 50): DataChannelMessage[] {
    let messages = this.messageQueue;

    if (type) {
      messages = messages.filter((m) => m.type === type);
    }

    return messages.slice(-limit);
  }

  /**
   * Get messages from specific participant
   */
  getMessagesFrom(from: string, limit: number = 50): DataChannelMessage[] {
    return this.messageQueue.filter((m) => m.from === from).slice(-limit);
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageQueue = [];
  }

  /**
   * Get message statistics
   */
  getStatistics(): {
    totalMessages: number;
    byType: Record<string, number>;
    byFrom: Record<string, number>;
  } {
    const stats = {
      totalMessages: this.messageQueue.length,
      byType: {} as Record<string, number>,
      byFrom: {} as Record<string, number>,
    };

    this.messageQueue.forEach((msg) => {
      stats.byType[msg.type] = (stats.byType[msg.type] || 0) + 1;
      stats.byFrom[msg.from] = (stats.byFrom[msg.from] || 0) + 1;
    });

    return stats;
  }
}

export const dataChannelsService = DataChannelsService.getInstance();
