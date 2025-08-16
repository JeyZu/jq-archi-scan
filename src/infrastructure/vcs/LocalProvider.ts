import path from 'path';
import { VCSProvider, RepoInfo } from '../../domain/ports';

export class LocalProvider implements VCSProvider {
  constructor(private baseDir: string, private repos: string[]) {}

  async pull(): Promise<RepoInfo[]> {
    return this.repos.map((name) => ({
      name,
      path: path.resolve(this.baseDir, name)
    }));
  }
}
