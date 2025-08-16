import { Scanner, RepoInfo } from '../../domain/ports';
import { Evidence } from '../../domain/models';
import { URL_REGEX, IPV4_REGEX, IPV6_REGEX } from './extractors';
import { isBinary } from 'istextorbinary';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';
import simpleGit from 'simple-git';
import yaml from 'js-yaml';

interface ScanConfig {
  includeGlobs: string[];
  excludeGlobs: string[];
  maxFileSizeKb: number;
}

export class FileScanner implements Scanner {
  constructor(private config: ScanConfig) {}

  private confidence(type: 'url' | 'ip' | 'docker', filePath: string): number {
    const isDoc = /README|docs/i.test(filePath);
    if (isDoc) return 0.5;
    if (type === 'url') return 0.9;
    if (type === 'ip') return 0.8;
    return 0.7;
  }

  async scanRepo(repo: RepoInfo): Promise<Evidence[]> {
    const { globby } = await import('globby');
    const git = simpleGit(repo.path);
    let commitSha = '';
    try {
      commitSha = await git.revparse(['HEAD']);
    } catch {}
    const files = await globby(this.config.includeGlobs, {
      cwd: repo.path,
      ignore: this.config.excludeGlobs,
      absolute: true
    });
    const evidences: Evidence[] = [];
    for (const file of files) {
      const stat = await fs.promises.stat(file);
      if (stat.size > this.config.maxFileSizeKb * 1024) continue;
      const relPath = path.relative(repo.path, file);
      if (await isBinary(file)) continue;
      const base = path.basename(file).toLowerCase();
      if (base.startsWith('docker-compose') && (base.endsWith('.yml') || base.endsWith('.yaml'))) {
        const content = fs.readFileSync(file, 'utf-8');
        const data: any = yaml.load(content);
        const services = Object.keys(data?.services || {});
        for (const svc of services) {
          evidences.push({
            repo: repo.name,
            filePath: relPath,
            line: 0,
            value: svc,
            type: 'docker',
            snippet: svc,
            snippetHash: crypto.createHash('sha256').update(svc).digest('hex'),
            commitSha,
            extractor: 'docker-service',
            confidence: this.confidence('docker', relPath),
            discoveredAt: new Date().toISOString()
          });
        }
        continue;
      }
      if (base === 'dockerfile') {
        const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);
        lines.forEach((line, idx) => {
          const m = line.match(/FROM\s+\S+(?:\s+AS\s+(\S+))?/i);
          if (m && m[1]) {
            const svc = m[1];
            evidences.push({
              repo: repo.name,
              filePath: relPath,
              line: idx + 1,
              value: svc,
              type: 'docker',
              snippet: line.trim(),
              snippetHash: crypto.createHash('sha256').update(line.trim()).digest('hex'),
              commitSha,
              extractor: 'dockerfile-stage',
              confidence: this.confidence('docker', relPath),
              discoveredAt: new Date().toISOString()
            });
          }
        });
      }
      const stream = fs.createReadStream(file);
      const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
      let lineNum = 0;
      for await (const line of rl) {
        lineNum++;
        let match;
        const urlRegex = new RegExp(URL_REGEX);
        while ((match = urlRegex.exec(line)) !== null) {
          const value = match[0];
          const snippet = line.trim();
          evidences.push({
            repo: repo.name,
            filePath: relPath,
            line: lineNum,
            value,
            type: 'url',
            snippet,
            snippetHash: crypto.createHash('sha256').update(snippet).digest('hex'),
            commitSha,
            extractor: 'url',
            confidence: this.confidence('url', relPath),
            discoveredAt: new Date().toISOString()
          });
        }
        const ip4Regex = new RegExp(IPV4_REGEX);
        while ((match = ip4Regex.exec(line)) !== null) {
          const value = match[0];
          const snippet = line.trim();
          evidences.push({
            repo: repo.name,
            filePath: relPath,
            line: lineNum,
            value,
            type: 'ip',
            snippet,
            snippetHash: crypto.createHash('sha256').update(snippet).digest('hex'),
            commitSha,
            extractor: 'ip',
            confidence: this.confidence('ip', relPath),
            discoveredAt: new Date().toISOString()
          });
        }
        const ip6Regex = new RegExp(IPV6_REGEX);
        while ((match = ip6Regex.exec(line)) !== null) {
          const value = match[0];
          const snippet = line.trim();
          evidences.push({
            repo: repo.name,
            filePath: relPath,
            line: lineNum,
            value,
            type: 'ip',
            snippet,
            snippetHash: crypto.createHash('sha256').update(snippet).digest('hex'),
            commitSha,
            extractor: 'ip',
            confidence: this.confidence('ip', relPath),
            discoveredAt: new Date().toISOString()
          });
        }
      }
    }
    return evidences;
  }
}
