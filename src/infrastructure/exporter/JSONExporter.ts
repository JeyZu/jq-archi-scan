import type { Exporter } from '../../domain/ports.js';
import type { Evidence, MatchResult } from '../../domain/models.js';
import { promises as fs } from 'fs';
import path from 'path';

export class JSONExporter implements Exporter {
  async export(match: MatchResult, evidences: Evidence[], outDir: string): Promise<void> {
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'graph.json'), JSON.stringify(match, null, 2));
    await fs.writeFile(path.join(outDir, 'evidences.json'), JSON.stringify(evidences, null, 2));
  }
}
