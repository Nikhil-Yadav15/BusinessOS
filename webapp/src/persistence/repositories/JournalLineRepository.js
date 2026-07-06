import { BaseRepository } from './BaseRepository.js';
import { journalLines } from '../../db/schema/ledger.js';

export class JournalLineRepository extends BaseRepository {
  static get table() {
    return journalLines;
  }
}
