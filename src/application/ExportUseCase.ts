import { Exporter } from '../domain/ports';
import { Evidence, MatchResult } from '../domain/models';

export class ExportUseCase {
  constructor(private exporters: Exporter[]) {}

  async execute(match: MatchResult, evidences: Evidence[], outDir: string): Promise<void> {
    for (const exporter of this.exporters) {
      await exporter.export(match, evidences, outDir);
    }
  }
}
