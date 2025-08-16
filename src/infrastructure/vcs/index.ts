import { Config } from '../../config';
import { VCSProvider } from '../../domain/ports';
import { LocalProvider } from './LocalProvider';
import { GitHubProvider } from './GitHubProvider';
import { GitLabProvider } from './GitLabProvider';

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
