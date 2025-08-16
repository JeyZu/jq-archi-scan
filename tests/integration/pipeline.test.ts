import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import simpleGit from 'simple-git';
import { LocalProvider } from '../../src/infrastructure/vcs/LocalProvider';
import { FileScanner } from '../../src/infrastructure/scanner/FileScanner';
import { DependencyMatcher } from '../../src/infrastructure/matcher/DependencyMatcher';
import { JSONExporter } from '../../src/infrastructure/exporter/JSONExporter';
import { PullUseCase } from '../../src/application/PullUseCase';
import { ScanUseCase } from '../../src/application/ScanUseCase';
import { MatchUseCase } from '../../src/application/MatchUseCase';
import { ExportUseCase } from '../../src/application/ExportUseCase';
import { loadIdentityRegistry } from '../../src/infrastructure/registry/IdentityRegistry';

describe('full pipeline', () => {
  it('scans, matches and exports', async () => {
    const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    const repoName = 'sample-repo';
    const repoPath = path.join(baseDir, repoName);
    fs.mkdirSync(repoPath);
    fs.writeFileSync(path.join(repoPath, 'app.js'), "fetch('http://billing.local'); const ip='10.10.0.5';");
    fs.writeFileSync(path.join(repoPath, 'Dockerfile'), 'FROM node:18 AS auth');
    fs.writeFileSync(path.join(repoPath, 'docker-compose.yml'), 'services:\n  billing-api:\n    image: billing');
    const git = simpleGit(repoPath);
    await git.init();
    await git.add('.');
    await git.commit('init');

    const provider = new LocalProvider(baseDir, [repoName]);
    const pullUC = new PullUseCase(provider);
    const repos = await pullUC.execute();

    const scanner = new FileScanner({ includeGlobs: ['**/*'], excludeGlobs: ['**/node_modules/**','**/.git/**','**/dist/**'], maxFileSizeKb: 100 });
    const scanUC = new ScanUseCase(scanner);
    const evidences = await scanUC.execute(repos);

    const registry = loadIdentityRegistry(path.resolve('examples/identities.yaml'));
    const matcher = new DependencyMatcher('suffix');
    const matchUC = new MatchUseCase(matcher);
    const match = await matchUC.execute(evidences, registry);

    const outDir = path.join(baseDir, 'out');
    const exportUC = new ExportUseCase([new JSONExporter()]);
    await exportUC.execute(match, evidences, outDir);

    expect(match.edges.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(outDir, 'graph.json'))).toBe(true);
  });
});
