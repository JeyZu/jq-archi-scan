import { VCSProvider, RepoInfo } from '../domain/ports';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = '.jqas';

export class PullUseCase {
  constructor(private provider: VCSProvider) {}

  async execute(): Promise<RepoInfo[]> {
    const repos = await this.provider.pull();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, 'repos.json'), JSON.stringify(repos, null, 2));
    return repos;
  }
}
