import { BaseRepository } from './BaseRepository.js';
import { brands } from '../../db/schema/catalog.js';

export class BrandRepository extends BaseRepository {
  static get table() {
    return brands;
  }
}
