import type { Scanner, RepoInfo } from '../domain/ports.js';
import type { Evidence } from '../domain/models.js';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = '.jqas';

export class ScanUseCase {
  constructor(private scanner: Scanner) {}

  async execute(repos: RepoInfo[]): Promise<Evidence[]> {
    let all: Evidence[] = [];
    for (const repo of repos) {
      const ev = await this.scanner.scanRepo(repo);
      all = all.concat(ev);
    }
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, 'evidence.json'), JSON.stringify(all, null, 2));
    return all;
  }
}
