export class Word {
  vocab_id?: number;
  term: string;
  definition: string;

  constructor(data: Partial<Word>) {
    this.vocab_id = data.vocab_id;
    this.term = data.term ?? '';
    this.definition = data.definition ?? '';
  }
}
