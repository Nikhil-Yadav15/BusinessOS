import { BaseRepository } from './BaseRepository.js';
import { journalEntries } from '../../db/schema/ledger.js';

export class JournalEntryRepository extends BaseRepository {
  static get table() {
    return journalEntries;
  }
}
