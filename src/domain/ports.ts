import { Evidence, MatchResult, IdentityRegistry } from './models';

export interface RepoInfo {
  name: string;
  path: string;
  url?: string;
}

export interface VCSProvider {
  pull(): Promise<RepoInfo[]>;
}

export interface Scanner {
  scanRepo(repo: RepoInfo): Promise<Evidence[]>;
}

export interface Matcher {
  match(evidences: Evidence[], registry: IdentityRegistry): MatchResult;
}

export interface Exporter {
  export(match: MatchResult, evidences: Evidence[], outDir: string): Promise<void>;
}
