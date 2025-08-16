import { Matcher } from '../../domain/ports';
import { Evidence, IdentityRegistry, MatchResult, MatchEdge } from '../../domain/models';
import ipaddr from 'ipaddr.js';

export class DependencyMatcher implements Matcher {
  constructor(private hostnameStrategy: 'suffix' | 'exact') {}

  match(evidences: Evidence[], registry: IdentityRegistry): MatchResult {
    const edges = new Map<string, MatchEdge>();
    for (const ev of evidences) {
      for (const app of registry.applications) {
        if (this.matches(ev, app)) {
          const key = `${ev.repo}->${app.appId}`;
          if (!edges.has(key)) {
            edges.set(key, { from: ev.repo, to: app.appId, evidences: [] });
          }
          edges.get(key)!.evidences.push(ev);
        }
      }
    }
    return { edges: Array.from(edges.values()) };
  }

  private matches(ev: Evidence, app: IdentityRegistry['applications'][number]): boolean {
    if (ev.type === 'url') {
      const host = extractHost(ev.value);
      if (!host) return false;
      return (app.domains || []).some((d) =>
        this.hostnameStrategy === 'suffix' ? host.endsWith(d) : host === d
      );
    }
    if (ev.type === 'ip') {
      return (app.cidr || []).some((c) => inCidr(ev.value, c));
    }
    if (ev.type === 'docker') {
      return (app.dockerServices || []).includes(ev.value);
    }
    return false;
  }
}

function extractHost(value: string): string | null {
  try {
    const u = new URL(value);
    return u.hostname;
  } catch {
    const m = value.match(/([a-zA-Z0-9.-]+)/);
    return m ? m[1] : null;
  }
}

function inCidr(ip: string, cidr: string): boolean {
  try {
    const addr = ipaddr.parse(ip);
    const [range, prefix] = ipaddr.parseCIDR(cidr);
    return addr.match(range, prefix);
  } catch {
    return false;
  }
}
