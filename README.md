# jq-archi-scan

`jq-archi-scan` is a minimal Node.js/TypeScript CLI that pulls Git repositories, scans files for URLs, IPs and Docker service names, matches them against a registry of known applications and exports a dependency graph.

## Quickstart

### Requirements
- Node.js 20+
- pnpm

### Install
```bash
pnpm install
pnpm build
```

### Configuration
Create a config file (YAML or JSON). See [examples/config.yaml](examples/config.yaml) for the full format.

### Commands
```bash
jq-archi-scan pull -c config.yaml
jq-archi-scan scan -c config.yaml
jq-archi-scan match -c config.yaml
jq-archi-scan export -c config.yaml -f json,csv -o ./out
```
The CLI stores intermediate results in `.jqas`.

### Identity Registry
Provide a registry of applications with domains, CIDRs and docker service names. Example in [examples/identities.yaml](examples/identities.yaml).

## Testing
```bash
pnpm test
```
