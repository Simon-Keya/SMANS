// types/notification.ts
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'CBC_UPDATE';

export interface NotificationBase {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string | null;            // Optional link to relevant page
  createdAt: Date;
}

export interface NotificationWithRelations extends NotificationBase {
  user: {
    id: string;
    name: string | null;
  };
}