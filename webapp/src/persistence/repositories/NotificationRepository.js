import { BaseRepository } from './BaseRepository.js';
import { notifications } from '../../db/schema/notification.js';

export class NotificationRepository extends BaseRepository {
  static get table() {
    return notifications;
  }
}
