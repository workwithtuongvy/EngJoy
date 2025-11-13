import { Word } from './word.model';

export class WordSet {
  word_set_id?: number;
  title: string;
  user_id: number;
  tag_ids: number[];          // chỉ dùng nếu xử lý tag_id ở giao diện
  words: Word[];
  last_update?: string;
  username?: string;
  termCount?: number;
  savedCount?: number;
  tags: string[];             // ✅ luôn đảm bảo là mảng

  constructor(data: Partial<WordSet>) {
    this.word_set_id = data.word_set_id;
    this.title = data.title ?? '';
    this.user_id = data.user_id ?? 0;
    this.tag_ids = data.tag_ids ?? [];
    this.words = (data.words ?? []).map(w => new Word(w));  // an toàn
    this.last_update = data.last_update;
    this.username = data.username;
    this.termCount = data.termCount;
    this.savedCount = data.savedCount;
    this.tags = data.tags ?? [];   // ✅ fallback an toàn
  }
}
