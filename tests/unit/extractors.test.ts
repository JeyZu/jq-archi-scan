import { describe, it, expect } from 'vitest';
import { URL_REGEX, IPV4_REGEX, IPV6_REGEX } from '../../src/infrastructure/scanner/extractors';

describe('regex extractors', () => {
  it('detects urls', () => {
    const line = 'Visit http://example.com and https://foo.bar:8080/path';
    const matches = line.match(URL_REGEX) || [];
    expect(matches).toContain('http://example.com');
    expect(matches).toContain('https://foo.bar:8080/path');
  });

  it('detects ipv4', () => {
    const line = 'Ping 10.0.0.1 and 192.168.1.5';
    const matches = line.match(IPV4_REGEX) || [];
    expect(matches).toEqual(['10.0.0.1', '192.168.1.5']);
  });

  it('detects ipv6', () => {
    const line = 'Addr 2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    const matches = line.match(IPV6_REGEX) || [];
    expect(matches[0]).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });
});
