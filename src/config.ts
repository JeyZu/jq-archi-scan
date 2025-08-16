import { z } from 'zod';
import fs from 'fs';
import yaml from 'js-yaml';

export const configSchema = z.object({
  provider: z.object({
    type: z.enum(['github', 'gitlab', 'local']),
    tokenEnv: z.string().optional(),
    orgsOrGroups: z.array(z.string()).default([])
  }),
  cloning: z.object({
    baseDir: z.string(),
    depth: z.number().default(1)
  }),
  scan: z.object({
    includeGlobs: z.array(z.string()),
    excludeGlobs: z.array(z.string()),
    maxFileSizeKb: z.number().default(1024)
  }),
  matching: z.object({
    identityFile: z.string(),
    hostnameMatchStrategy: z.enum(['suffix', 'exact']).default('suffix')
  }),
  export: z.object({
    formats: z.array(z.enum(['json', 'csv'])),
    outDir: z.string()
  })
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(path: string): Config {
  const raw = fs.readFileSync(path, 'utf-8');
  const data = path.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw);
  return configSchema.parse(data);
}
