# Frontend architecture

The application follows one dependency direction:

`View → composable → repository → data source`

## Responsibilities

- `views/`: route-level orchestration only.
- `components/`: reusable UI; they receive data and emit user intent.
- `composables/`: screen state and loading workflow.
- `repositories/`: the data boundary. Replace the mock URLs here when FastAPI is ready.
- `domain/`: pure product rules and document composition.
- `public/mock-api/`: static JSON endpoints that simulate FastAPI on GitHub Pages.
- `data/`: offline fallback fixtures only.
- `app/router.js`: route definitions. Gallery and isolated demo routes live here.

## Rules that keep the code readable

1. Components never fetch data directly.
2. Repositories never manage UI state.
3. Domain functions do not import Vue or browser APIs.
4. Demo code always runs in a sandboxed iframe, never in the application document.
5. Add a file only when it owns a distinct responsibility.
6. Prefer native browser features before adding a dependency.

## Preview media contract

Preview images use a single `4:3` aspect ratio. Admin uploads will be cropped to
that ratio before storage, so gallery cards and the details dialog can fill their
media area without letterboxing, stretching, or layout-specific exceptions.

The Repository pattern is the deliberate seam for FastAPI. The rest is regular Vue composition, without an unnecessary global store or component library.

## Prompt package

`prompt-kits.json` stores one shared manifesto, one editable user-request template,
and immutable constants keyed by design. The repository selects a design kit,
`promptPackage.js` serializes its three files and merged Markdown, and the download
service packages the same files into a dependency-free ZIP archive.
