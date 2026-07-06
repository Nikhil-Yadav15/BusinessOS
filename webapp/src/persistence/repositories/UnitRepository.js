import { BaseRepository } from './BaseRepository.js';
import { units } from '../../db/schema/catalog.js';

export class UnitRepository extends BaseRepository {
  static get table() {
    return units;
  }
}
