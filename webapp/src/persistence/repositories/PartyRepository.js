import { BaseRepository } from './BaseRepository.js';
import { parties } from '../../db/schema/crm.js';

export class PartyRepository extends BaseRepository {
  static get table() {
    return parties;
  }
}
