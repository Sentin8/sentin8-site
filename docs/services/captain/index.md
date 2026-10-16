---
sidebar_position: 19
---

# Sentin8:Captain - Process Supervisor

The starter that runs the fleet: health-gated tier spawning (the DAG
of boot order), rolling zero-downtime upgrades (`upgrade-instance`:
start new → wait `Active` → drain old → stop), remote spawn across
machines, placement enforcement (singletons, edge pins), and machine
provisioning backends (docker/Proxmox/AWS).

## Use cases

- **Fleet bring-up** - `make start` boots captain, which spawns the
  enrolled platform + vertical services in dependency tiers.
- **Rolling upgrades** - a new binary ships to one instance at a time
  while the proxy round-robins traffic; drain happens only after the
  successor registers `Active`.
- **Fleet placement** - singleton services (acme, proxy) enforce
  one-instance; edge services pin to the edge machine; the autoscaler
  spawns remotely when saturation demands.
- **Provisioning** - tofu kits (docker/Proxmox/cloud) grow the fleet
  on demand, with graceful-leave deprovisioning.

## Operator surface

| Command | Role |
|---|---|
| `make status` | fleet status, `KEY=<ip:port>` per instance |
| `make upgrade-instance KEY=…` | rolling zero-downtime swap |
| `make restart-instance KEY=…` | hard restart of one instance |
| `make stop/start-instance KEY=…` | stop/start one instance |

Captain's own REST surface (`POST /v1/captain/instances`,
`POST /v1/captain/shutdown`, health) is certificate-guarded.

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) - the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) - the full document, harvested from the unit's repository at build time.
- [Security](security) - the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/captain/) - the maintainer's README in the consolidated reference section.

