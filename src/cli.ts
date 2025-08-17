#!/usr/bin/env node
import { program } from 'commander';
import { loadConfig } from './config.js';
import { createVCSProvider } from './infrastructure/vcs/index.js';
import { FileScanner } from './infrastructure/scanner/FileScanner.js';
import { loadIdentityRegistry } from './infrastructure/registry/IdentityRegistry.js';
import { DependencyMatcher } from './infrastructure/matcher/DependencyMatcher.js';
import { JSONExporter } from './infrastructure/exporter/JSONExporter.js';
import { CSVExporter } from './infrastructure/exporter/CSVExporter.js';
import { PullUseCase } from './application/PullUseCase.js';
import { ScanUseCase } from './application/ScanUseCase.js';
import { MatchUseCase } from './application/MatchUseCase.js';
import { ExportUseCase } from './application/ExportUseCase.js';
import { promises as fs } from 'fs';
import path from 'path';
import type { RepoInfo } from './domain/ports.js';
import type { Evidence, MatchResult } from './domain/models.js';

const DATA_DIR = '.jqas';

program.name('jq-archi-scan').description('Repository dependency scanner');

program
  .command('pull')
  .requiredOption('-c, --config <file>', 'config file')
  .action(async (opts) => {
    const config = loadConfig(opts.config);
    const provider = createVCSProvider(config);
    const uc = new PullUseCase(provider);
    await uc.execute();
  });

program
  .command('scan')
  .requiredOption('-c, --config <file>', 'config file')
  .action(async (opts) => {
    const config = loadConfig(opts.config);
    const provider = createVCSProvider(config);
    let repos: RepoInfo[];
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, 'repos.json'), 'utf-8');
      repos = JSON.parse(raw);
    } catch {
      repos = await provider.pull();
    }
    const scanner = new FileScanner(config.scan);
    const uc = new ScanUseCase(scanner);
    await uc.execute(repos);
  });

program
  .command('match')
  .requiredOption('-c, --config <file>', 'config file')
  .action(async (opts) => {
    const config = loadConfig(opts.config);
    const raw = await fs.readFile(path.join(DATA_DIR, 'evidence.json'), 'utf-8');
    const evidences: Evidence[] = JSON.parse(raw);
    const registry = loadIdentityRegistry(config.matching.identityFile);
    const matcher = new DependencyMatcher(config.matching.hostnameMatchStrategy);
    const uc = new MatchUseCase(matcher);
    await uc.execute(evidences, registry);
  });

program
  .command('export')
  .requiredOption('-c, --config <file>', 'config file')
  .option('-f, --formats <list>', 'formats comma separated')
  .option('-o, --out <dir>', 'output directory')
  .action(async (opts) => {
    const config = loadConfig(opts.config);
    const formats: string[] = opts.formats ? opts.formats.split(',') : config.export.formats;
    const outDir: string = opts.out || config.export.outDir;
    const evidences: Evidence[] = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'evidence.json'), 'utf-8'));
    const match: MatchResult = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'matches.json'), 'utf-8'));
    const exporters = formats.map((f) => (f === 'json' ? new JSONExporter() : new CSVExporter()));
    const uc = new ExportUseCase(exporters);
    await uc.execute(match, evidences, outDir);
  });

program.parseAsync(process.argv);
