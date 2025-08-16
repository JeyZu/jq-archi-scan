import { VCSProvider, RepoInfo } from '../../domain/ports';
import simpleGit from 'simple-git';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

export class GitLabProvider implements VCSProvider {
  constructor(
    private tokenEnv: string,
    private groups: string[],
    private baseDir: string,
    private depth: number
  ) {}

  async pull(): Promise<RepoInfo[]> {
    const token = process.env[this.tokenEnv] || '';
    const repos: RepoInfo[] = [];
    for (const group of this.groups) {
      const { data } = await axios.get(`https://gitlab.com/api/v4/groups/${group}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      for (const repo of data) {
        const localPath = path.join(this.baseDir, repo.name);
        const cloneUrl = repo.http_url_to_repo;
        if (fs.existsSync(localPath)) {
          await simpleGit(localPath).pull();
        } else {
          await simpleGit().clone(cloneUrl.replace('https://', `https://oauth2:${token}@`), localPath, {
            '--depth': this.depth
          });
        }
        repos.push({ name: repo.name, path: localPath, url: cloneUrl });
      }
    }
    return repos;
  }
}
