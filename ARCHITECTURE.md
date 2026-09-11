# Frontend architecture

The application follows one dependency direction:

`View → composable → repository → data source`

## Responsibilities

- `views/`: route-level orchestration only.
- `components/`: reusable UI; they receive data and emit user intent.
- `composables/`: screen state and loading workflow.
- `repositories/`: the data boundary. Replace the mock implementation here when FastAPI is ready.
- `domain/`: pure product rules such as responsive batch sizing.
- `data/`: temporary development fixtures only.
- `app/router.js`: route definitions; the gallery is the only route for now.

## Rules that keep the code readable

1. Components never fetch data directly.
2. Repositories never manage UI state.
3. Domain functions do not import Vue or browser APIs.
4. Add a file only when it owns a distinct responsibility.
5. Prefer native browser features before adding a dependency.

The Repository pattern is the deliberate seam for FastAPI. The rest is regular Vue composition, without an unnecessary global store or component library.
