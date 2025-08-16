import { VCSProvider, RepoInfo } from '../../domain/ports';
import simpleGit from 'simple-git';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

export class GitHubProvider implements VCSProvider {
  constructor(
    private tokenEnv: string,
    private orgs: string[],
    private baseDir: string,
    private depth: number
  ) {}

  async pull(): Promise<RepoInfo[]> {
    const token = process.env[this.tokenEnv] || '';
    const repos: RepoInfo[] = [];
    for (const org of this.orgs) {
      const { data } = await axios.get(`https://api.github.com/orgs/${org}/repos`, {
        headers: { Authorization: `token ${token}` }
      });
      for (const repo of data) {
        const localPath = path.join(this.baseDir, repo.name);
        if (fs.existsSync(localPath)) {
          await simpleGit(localPath).pull();
        } else {
          await simpleGit().clone(repo.clone_url.replace('https://', `https://${token}@`), localPath, {
            '--depth': this.depth
          });
        }
        repos.push({ name: repo.name, path: localPath, url: repo.clone_url });
      }
    }
    return repos;
  }
}
