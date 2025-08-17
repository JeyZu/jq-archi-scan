import type { Config } from '../../config.js';
import type { VCSProvider } from '../../domain/ports.js';
import { LocalProvider } from './LocalProvider.js';
import { GitHubProvider } from './GitHubProvider.js';
import { GitLabProvider } from './GitLabProvider.js';

export function createVCSProvider(config: Config): VCSProvider {
  const { provider, cloning } = config;
  if (provider.type === 'local') {
    return new LocalProvider(cloning.baseDir, provider.orgsOrGroups);
  }
  if (provider.type === 'github') {
    return new GitHubProvider(provider.tokenEnv || '', provider.orgsOrGroups, cloning.baseDir, cloning.depth);
  }
  return new GitLabProvider(provider.tokenEnv || '', provider.orgsOrGroups, cloning.baseDir, cloning.depth);
}
