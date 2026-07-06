import { BaseRepository } from './BaseRepository.js';
import { categories } from '../../db/schema/catalog.js';

export class CategoryRepository extends BaseRepository {
  static get table() {
    return categories;
  }
}
