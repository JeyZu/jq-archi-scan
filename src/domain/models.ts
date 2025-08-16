export interface Evidence {
  repo: string;
  filePath: string;
  line: number;
  value: string;
  type: 'url' | 'ip' | 'docker';
  snippet: string;
  snippetHash: string;
  commitSha: string;
  extractor: string;
  confidence: number;
  discoveredAt: string;
}

export interface ApplicationIdentity {
  appId: string;
  domains?: string[];
  cidr?: string[];
  dockerServices?: string[];
}

export interface IdentityRegistry {
  applications: ApplicationIdentity[];
}

export interface MatchEdge {
  from: string;
  to: string;
  evidences: Evidence[];
}

export interface MatchResult {
  edges: MatchEdge[];
}
