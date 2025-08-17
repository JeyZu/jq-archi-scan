import type { Exporter } from '../../domain/ports.js';
import type { Evidence, MatchResult } from '../../domain/models.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { format } = require('@fast-csv/format') as typeof import('@fast-csv/format');

export class CSVExporter implements Exporter {
  async export(match: MatchResult, evidences: Evidence[], outDir: string): Promise<void> {
    await fs.promises.mkdir(outDir, { recursive: true });
    await new Promise<void>((resolve) => {
      const csvStream = format({ headers: true });
      const ws = fs.createWriteStream(path.join(outDir, 'graph.csv'));
      csvStream.pipe(ws).on('finish', () => resolve());
      match.edges.forEach((e) => csvStream.write({ from: e.from, to: e.to, evidences: e.evidences.length }));
      csvStream.end();
    });
    await new Promise<void>((resolve) => {
      const csvStream = format({ headers: true });
      const ws = fs.createWriteStream(path.join(outDir, 'evidences.csv'));
      csvStream.pipe(ws).on('finish', () => resolve());
      evidences.forEach((e) =>
        csvStream.write({
          repo: e.repo,
          filePath: e.filePath,
          line: e.line,
          value: e.value,
          type: e.type,
          confidence: e.confidence
        })
      );
      csvStream.end();
    });
  }
}
