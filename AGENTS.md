# Antigravity Rules: Codebase Memory & Token Conservation

These rules govern how the agent interacts with the codebase to maximize context efficiency and reduce token consumption using the `codebase-memory` MCP server.

- **Project ID (`project`)**: `C-Users-Ariel-Abraham-My-Drive-noreply.kopinergi-gmail.com-Gesoi.id-gesoi.id`
  *(Use this exact ID directly in `codebase-memory` tool calls to skip calling `list_projects`.)*

---

## 1. Graph-First Exploration Protocol
Whenever tasked with understanding repository structure, locating functions or classes, or tracking architectural dependencies:
- **ALWAYS query `codebase-memory` MCP tools first:**
  - `manage_adr` (`mode: "get"` or `"outline"`): Read persisted architectural decisions and project overview first before re-exploring the repo.
  - `get_architecture`: Call with targeted `aspects` (e.g., `["overview", "routes", "entry_points", "file_tree"]`) to inspect module structure without reading multiple files.
  - `search_graph`: Find symbols (functions, components, classes, routes, variables) via `query`, `name_pattern`, `label`, or natural-language `semantic_query` in sub-milliseconds.
  - `get_file_outline`: Inspect all symbol declarations and line ranges inside a single file before reading it.
  - `get_code_snippet`: Read a symbol's source code directly from the graph (`source_mode: "auto"` caps token output automatically) instead of opening full files.
  - `trace_path`: Inspect call hierarchies, callers (`direction: "inbound"`), callees (`direction: "outbound"`), or `both` (`mode: "calls"` | `"data_flow"`) across layers instead of opening intermediate files.
- **NEVER perform broad directory tree dumps or recursive grep searches** when the knowledge graph can answer the query. Use `search_code` only for string literals or files flagged under `parse_partial` / `not_indexed`.

---

## 2. Minimalist File Reading (`read_file` Guardrails)
- **Do NOT read entire source files** during exploration or search.
- Prefer `get_code_snippet` for inspecting functions, classes, or components by `qualified_name`.
- When `read_file` is required for code modification or non-symbol lines:
  1. Retrieve the exact line ranges first from `search_graph`, `get_file_outline`, or `trace_path`.
  2. Invoke `read_file` strictly specifying `StartLine` and `EndLine` for the target block.
  3. Keep the reading window focused (target ± 20–30 lines of necessary context).

---

## 3. Change & Impact Verification
- Before refactoring or modifying a function or component:
  - Run `trace_path` (`direction: "both"` or `"inbound"`) to check which modules, pages, and tests rely on the symbol.
  - Run `detect_changes` (`scope: "impact"` or `"tests"`) when evaluating git diffs to identify affected callers and unit tests.
- After making significant code or structural changes:
  - Refresh the persistent index via `index_repository` with `persistence: true`.
  - Record significant architectural changes using `manage_adr` (`mode: "update"` or `"set_sections"`) so future sessions retain context without re-analyzing the codebase.
