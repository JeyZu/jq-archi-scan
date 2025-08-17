import type { Matcher } from '../domain/ports.js';
import type { Evidence, MatchResult, IdentityRegistry } from '../domain/models.js';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = '.jqas';

export class MatchUseCase {
  constructor(private matcher: Matcher) {}

  async execute(evidences: Evidence[], registry: IdentityRegistry): Promise<MatchResult> {
    const result = this.matcher.match(evidences, registry);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, 'matches.json'), JSON.stringify(result, null, 2));
    return result;
  }
}
