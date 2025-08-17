import fs from 'fs';
import { createRequire } from 'node:module';
import type { IdentityRegistry } from '../../domain/models.js';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml') as typeof import('js-yaml');

export function loadIdentityRegistry(file: string): IdentityRegistry {
  const raw = fs.readFileSync(file, 'utf-8');
  const data = file.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw);
  return data as IdentityRegistry;
}
