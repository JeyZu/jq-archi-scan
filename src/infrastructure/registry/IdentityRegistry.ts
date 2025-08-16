import fs from 'fs';
import yaml from 'js-yaml';
import { IdentityRegistry } from '../../domain/models';

export function loadIdentityRegistry(file: string): IdentityRegistry {
  const raw = fs.readFileSync(file, 'utf-8');
  const data = file.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw);
  return data as IdentityRegistry;
}
