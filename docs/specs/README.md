---
type: infrastructure
---
# Specs — per-subsystem specifications

These documents describe how each subsystem behaves: its flow, boundaries,
error states, and testing strategy. They evolve with the code and reference
the ADRs that shaped them.

Specs use a `type:` frontmatter tag: `infrastructure` (cross-cutting,
on every branch) or `feature` (application behavior, under `docs/specs/<domain>/`).

**New feature specs start from [`_template-feature.md`](_template-feature.md)**
(every section required); **new infrastructure specs start from
[`_template-infrastructure.md`](_template-infrastructure.md)** (fixed opening
and closing — Purpose, then Verify + Key ADRs — with a free-form middle that
fits the content). A spec is born in the working session that builds
the behavior: drafted from its issue, reviewed and corrected, landed in the
same PR as the code. From then on it is evergreen — the PR that changes the
behavior updates the spec. Linkage is one-way: issues cite specs; specs never
store issue state. See [CONTRIBUTING](../../CONTRIBUTING.md) for the full arc.

| Doc | Type | What it covers | Key ADRs |
|---|---|---|---|
| [monorepo](monorepo.md) | infrastructure | Apps vs packages layout, dependency rules, `@project` scope placeholder | 0001, 0009 |
| [seams](seams.md) | infrastructure | The unifying seam pattern: local stand-in by default, real cloud via env var | 0005, 0008, 0003 |
| [storage](storage.md) | infrastructure | Local-vs-real Azure pattern across blob and queue | 0006, 0008, 0005 |
| [web](web.md) | infrastructure | Health endpoint, async-honesty UI standard, server entry ritual + error shape (404-not-403) | 0003, 0009 |
| [auth](auth.md) | infrastructure | Identity derivation: dev stub now, sessions later, same seam | 0003 |
| [deploy](deploy.md) | infrastructure | Container build + Azure topology, config via env only, kill-switches | 0008 |
| [observability](observability.md) | infrastructure | Structured logs, request IDs, what gets measured | — |

### Items domain (`items/`)

| Doc | Type | What it covers | Key ADRs |
|---|---|---|---|
| [list](items/list.md) | feature | List my items, scoped by user, excludes soft-deleted | 0009, 0003 |
| [create](items/create.md) | feature | Create an item with Zod validation + CREATED event | 0009 |
| [detail](items/detail.md) | feature | View item detail, ownership, lightbox | 0009 |
| [attachment](items/attachment.md) | feature | Upload/download image, blob storage, MIME validation | 0006, 0008 |
| [thumbnail](items/thumbnail.md) | feature | Worker thumbnail generation with sharp, queue pipeline | 0006, 0007, 0008 |
| [live-progress](items/live-progress.md) | feature | SSE live progress for thumbnail pipeline, pg_notify fan-out | 0007, 0005 |

Feature specs live under `docs/specs/<domain>/`, grouped by the domain they
describe. In this template repo the `items/` domain is a worked demonstration;
an application built from this template keeps its own domains on `main`.
