import path from 'path';
import type { VCSProvider, RepoInfo } from '../../domain/ports.js';

export class LocalProvider implements VCSProvider {
  constructor(private baseDir: string, private repos: string[]) {}

  async pull(): Promise<RepoInfo[]> {
    return this.repos.map((name) => ({
      name,
      path: path.resolve(this.baseDir, name)
    }));
  }
}
