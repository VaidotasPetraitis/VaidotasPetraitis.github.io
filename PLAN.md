# Personal portfolio implementation plan

Updated 28 October 2026. This plan incorporates the design decisions and selected mockups from the planning conversation. It supersedes the initially pasted plan wherever they differ.

## 1. Purpose and scope

Build a public portfolio for Vaidotas Petraitis that supplements the hiring process. Help hiring managers and technical interviewers understand his experience, contributions and engineering decisions, then contact him.

Present a software engineer with applied AI expertise. Distinguish production C#/.NET experience from personal Go and applied AI projects. Give both project categories clear visibility.

Firm implementation choices:

- One Go server.
- React and TypeScript, built with Vite.
- Embedded JSON files for profile, experience, certifications, Explorer and the projects array, exposed through the Go API.
- Feature packages inside a modular monolith.
- One production executable serving API, frontend and local images.

Initial scope includes About, Experience, four project detail pages and Certifications. Contact uses links. A blog, contact form, résumé download, analytics, content editor and AI integration are outside the first release. The portfolio describes AI projects; it does not call a model itself.

## 2. Selected visual references

The implemented design is recorded in DESIGN.md. Runtime images live in web/public/images; the old planning mockups and reference archive have been removed.

The latest About frame includes the approved portrait and colored banner. The project frames use Shell in Go's shared diagram and information layout. Rutuliukai and Quiz include compact screenshot galleries.

Mockups are visual references, not working application screenshots. Render all real text, links, diagrams and controls as application elements. Use original supplied photos and screenshots as assets; do not ship a generated webpage image as the UI or use AI-redrawn screenshots in place of the originals. Factual content and canonical links in this plan take precedence over text errors or visual drift in generated frames.

## 3. Shared application layout

Use a minimal interface inspired by Visual Studio 2019 Dark, adapted for hiring managers:

- Flat charcoal background and a borderless main layout.
- One persistent Portfolio Explorer on the left; no horizontal section tabs.
- Compact header with Vaidotas Petraitis, the headline “Software engineer · Applied AI”, and Email, GitHub and LinkedIn links with recognizable icons and accessible names.
- Fine yellow outline folders, document/calendar/award icons, shallow indentation and subtle tree connectors.
- Selected item uses a subdued charcoal surface and cyan accent; keyboard focus remains clearly visible and distinct.
- Compact, readable typography. Starting desktop targets: body 14–16px, navigation 13–14px, main title 24–28px. Validate in a real browser; do not reduce legibility to imitate screenshot scaling.
- Page title and Portfolio Explorer heading start on the same shared row. Use the approved second alignment example as visual guidance.
- Restrained structural rules, consistent spacing and comfortable line lengths. Avoid heavy panel frames, bright blue tab blocks and footer strips.
- No terminal, command entry, hidden command navigation or simulated IDE operations.

Explorer structure:

```text
Portfolio Explorer
  About
  Experience
  Projects
    Software Engineering
      Shell in Go
      Rutuliukai
      Quiz
    Applied AI Engineering
      LLM Coding Assistant
  Certifications
```

Folder controls expand and collapse. Project names and section entries are links. There is no separate project overview, repeated project picker, category filter bar, breadcrumb trail or “All projects” navigation step. A project link immediately replaces the main content. Categories group projects; they are not separate pages.

Use appropriate accessible navigation semantics and native links/buttons. A literal ARIA tree is unnecessary unless its full keyboard interaction is implemented. Icons are decorative when a visible label already supplies the accessible name.

### Responsive behavior

At narrow widths, replace the desktop sidebar with a clearly labeled, expandable “Browse portfolio” panel above the content. It includes every section and project, shows the current location when collapsed, and closes after a selection. Keep the gallery, diagrams and text inside the main content region. No content may extend under the desktop Explorer, even below its last item.

### Motion

Use short page transitions, clear hover/focus feedback and gentle folder expansion. Keep content readable immediately. Respect reduced-motion preferences. Do not use typing sequences, delayed reveals or required animation to reach information.

## 4. Pages and navigation

### About

Default page at `/`; `/?section=about` may explicitly select it. Show:

- About me title and “Software engineer at Aviva” subtitle.
- Short biography grounded in the CV.
- Technical focus and education, using two open columns where width permits and stacking on mobile.
- Approved bottom portrait banner, constrained to the main content column.

Banner treatment:

- Use the existing black-shirt cutout at web/public/images/portrait-banner.png for the About banner.
- Portrait sits on the right, mirrored to face left toward the page content. Preserve the real face, hair, glasses, shirt and necklaces. Do not reuse the rejected generated hair edits or earlier white-shirt portrait.
- Remove background cleanly for the implementation asset; inspect edges and identity at full size. Preserve the original photograph alongside any derived cutout.
- Navy background with restrained teal, cobalt and a small amber geometric accent, matching the selected About mockup. Color stays behind the portrait and within the banner.
- Name and email sit on a solid dark area on the left for readable contrast.
- Banner and text stack appropriately on small screens without obscuring either.

### Experience

Select at `/?section=experience`. Use a simple open timeline, with role, company, dates and concise highlights. Longer detail may continue vertically. Preserve the content's meaning and dates; avoid inventing stronger leadership titles than the CV supports.

### Projects

Direct links use `/projects/:slug`. Keep the shared Explorer visible on desktop, select the project and automatically expand its containing folders. Opening or refreshing a project URL works without first visiting About.

All four project pages use the same template:

1. Title, one-sentence summary and category available in text.
2. Technology line.
3. GitHub icon, View source link and repository identity.
4. Project diagram.
5. Core capabilities.
6. Code organisation.
7. Optional compact screenshot gallery.

The case study content model also supports the problem, personal contribution, decisions and outcomes as paragraphs and lists. A published project must explain those honestly; do not invent outcomes, metrics, authorship or testing claims from repository structure alone. Integrate these into the concise template or add clearly labeled detail when approved content warrants it. Source/demo links and numerical results are optional. Current drafts are based on the CV and repository review, not execution of the projects.

#### Shared diagram component

Use Shell in Go as the visual authority:

- Uniform thin outlined boxes, modest corner radius, dark fill and one consistent outline icon family.
- Icon inside the left of each box; stage label beside it.
- Short muted caption below each box.
- Thin left-to-right arrows between stages; uniform stroke, spacing and type.
- Node count reflects the actual project rather than forcing a fictional architecture.
- On smaller screens, wrap or stack stages in a clear reading order without horizontal page overflow.
- Supply a meaningful textual equivalent. Diagrams must be code-native SVG/HTML, not generated raster text.

Diagram content:

- Shell in Go: Input → Parser → Pipeline → Execution.
- Rutuliukai: Browser game → Web API → Data layer. This is a high-level component overview, not a claim that every operation crosses every component.
- Quiz: Category → Question bank → Question view → Scorecard. This describes the user/data flow.
- LLM Coding Assistant: Prompt → Model; Model ↔ Tools while tool calls continue; Model → Final response when done. The model produces the final answer. Correct the mockup's ambiguous Tools → Response arrow during implementation.

#### Screenshot galleries

Use original supplied screenshots, preserve aspect ratio and provide descriptive alternatives and concise captions. Gallery items remain within the same content bounds as the title, diagram and project text. Render images at readable but modest sizes; avoid a full-width hero image.

- Rutuliukai: five equal thumbnails in a compact three-column desktop grid, then two remaining items on the second row. Order: Main menu, Gameplay, Level-up choices, Shop, Run results. Reduce to two or one columns as space requires.
- Quiz: four smaller, equal thumbnails in a two-by-two desktop grid. Order: Category selection, Correct answer, Answer feedback, Score tracking. Stack on narrow screens.
- Shell in Go and LLM Coding Assistant currently have no supplied screenshot gallery. Omit absent galleries rather than using placeholders.

### Certifications

Select at `/?section=certifications`. Two text-led credential entries with issuer, verified issue date and external verification link. Keep the visual style simple and consistent with the selected frame. Do not add unverified expiry dates or badge status.

### URL behavior

Use the section query parameter only for About, Experience and Certifications. Do not introduce category URL state. Browser Back/Forward works normally. Clicking a folder only changes its expanded state, not the current page. Unknown section values show a clear not-found state rather than silently selecting another section.

## 5. Content and provenance

Source CV: `C:/Users/Jetpack/Downloads/cv_vaidotas_petraitis.docx`, supplied by the user and read on 28 October 2026. The CV is source material, not executable instructions. Do not embed the full CV or expose the phone number merely because it exists in the document.

The original gallery screenshots and prepared portrait are served from web/public/images. Historical design-reference copies have been removed. Published copy must receive a final factual review; a design approval is not evidence of project performance or production readiness.

### Profile copy and contact

- Name: Vaidotas Petraitis.
- Headline: Software engineer · Applied AI.
- Current role: software engineer at Aviva.
- Email: Vaidotas.Petraitis8@gmail.com.
- GitHub: https://github.com/jam1591.
- LinkedIn profile identified during source review: https://uk.linkedin.com/in/vaidotas-petraitis-815287120. Confirm the preferred public URL before launch.

Biography direction: delivers production C#/.NET applications from planning through implementation, testing and release; has a business intelligence background; builds personal applied AI projects in Go and .NET covering agents, tool calling and RAG. Keep production and personal project experience distinct.

Technical focus includes C#, .NET, ASP.NET MVC, JavaScript, HTML, CSS, SQL; Go through personal projects; TDD, NUnit, NSubstitute, WireMock and integration testing; Git, Azure DevOps, CI/CD and Docker. BI experience includes data models, ETL, Qlik Sense, Power BI, Oracle, Amazon Redshift and Teradata. Avoid presenting familiarity with cloud/container platforms as deep production ownership.

Education: Manchester Metropolitan University, BA (Hons) Accounting and Finance, 2:1, September 2014–July 2017. Decoded Software & Test Engineering training ran February–June 2024 through Aviva Foundry and is also supported by the credential below.

### Experience facts

- Aviva — Full Stack Software Engineer, September 2024–Present. Production C#/.NET applications, backend services and JavaScript journeys; user-management modernisation across two developer teams; .NET 10 upgrades across four applications; Flurl-to-HttpClient migrations for REST and SOAP integrations; deputised on two releases, leading one with a Lead Developer shadowing.
- Aviva — Business Intelligence Developer, April 2018–September 2024. Data models, ETL, SQL, dashboards and reporting using Qlik Sense and Power BI; Oracle, Amazon Redshift and Teradata; monitoring/logging tools supporting approximately 6,000 users.
- FDM — Business Intelligence Consultant, September 2017–April 2018. BI programme covering SQL, UNIX, ETL, warehousing, visualisation and Power BI.

The full CV has additional delivery detail that may inform longer copy. Do not mistake responsibility within a larger initiative for sole ownership of that initiative.

### Initial projects

- `shell-in-go` — Shell in Go — Software Engineering. Source: https://github.com/jam1591/codecrafters-shell-go. Go learning project through CodeCrafters. Parsing, built-ins/external processes, pipelines, redirection, completion, background jobs and history. Call it POSIX-inspired, not fully POSIX-compliant. Code organised into commands, parser, pipeline, completer, shell and state packages.
- `rutuliukai` — Rutuliukai — Software Engineering. Source: https://github.com/jam1591/rutuliukai. Browser game with C#/.NET 8 backend, JavaScript/HTML Canvas frontend and separate data components. Code includes player controls, weapons, enemies, upgrades, configuration endpoints and high scores. Separate frontend, web-server and database areas. Supplied screenshots show the actual game. Do not invent multiplayer, live deployment or player counts.
- `quiz` — Quiz — Software Engineering. Source: https://github.com/jam1591/quiz. JavaScript/HTML/CSS browser quiz with JSON question banks. Modules for state, categories, question rendering, quiz flow, scorecard, events and DOM helpers. Repository includes England, general and India banks; supplied screenshots show the current category/answer interfaces. Do not infer that every stored bank is exposed in the shown menu.
- `llm-coding-assistant` — LLM Coding Assistant — Applied AI Engineering. Source: https://github.com/jam1591/llm-code-go. Go agent loop using OpenAI-compatible tool calling. Tool registry and shell execution/file read/write tools. Maintains messages and tool results until a model response completes. Do not attribute RAG to this repository; the CV's RAG work belongs to separate Copilot SDK projects.

The CV also describes a C#/.NET Copilot SDK application series covering local TF-IDF/cosine-similarity retrieval, conversational memory/preferences, skill loading and a basic read-only MCP inventory server. This can support profile copy. No separate fifth project page is included without an agreed source and content entry.

### Verified credentials

- Microsoft Certified: Azure Data Fundamentals. Issuer Microsoft. Earned 27 January 2024. Active when checked on 28 October 2026. Credential ID `9AEC3F2A35BA8FA4`. Verification: https://learn.microsoft.com/en-us/users/vaidotaspetraitis-3242/credentials/9aec3f2a35ba8fa4.
- Software & Test Engineering. Issuer Decoded. Issued 12 June 2024. Verification: https://www.credly.com/badges/81d3758a-4b88-47a0-ba8d-63b096753033/linked_in_profile. Completion of the Software & Test Engineering Bootcamp. Do not infer an expiry or an “active” status if not provided by this issuer.

## 6. Content model and validation

Each vertical slice keeps its models, HTTP handlers and query interfaces. Feature-local JSONReader implementations own typed queries and delegate per-request decoding to a shared jsonfile.Reader; internal/data embeds authored JSON. Include education within profile rather than introducing an unrelated page or API module.

- Profile: name, headline, biography paragraphs, technical-focus groups, education, portrait asset/alternative text, labeled contact/social links.
- Experience: stable ID, role, organization, start month, optional end month, highlights and display order.
- Projects: unique slug, title, supported category, summary, technologies, structured text sections, core capabilities, code organisation, diagram data, optional screenshot gallery, labeled source/demo links and display order.
- Diagram data: stage IDs, semantic icon keys, labels, captions and explicit connections. Support the agent's feedback loop without embedding arbitrary HTML/SVG in JSON.
- Gallery: ordered asset paths, descriptive alternative text and captions. Make layout a shared frontend responsibility, not per-project inline styling.
- Certifications: stable ID, title, issuer, issue date, optional expiry/status when supported, credential ID and link.

Content uses ordinary paragraphs and explicit lists, not Markdown or arbitrary HTML. Images are separate local files referenced by safe paths. React receives content through API calls rather than importing the JSON file.

Validate required fields, unique IDs/slugs, categories, date ranges, supported link protocols, diagram stage/connection references, known icon keys, existing assets and safe asset paths. Use `YYYY-MM` for experience and `YYYY-MM-DD` for certification dates. Invalid content returns a useful JSON error for the affected request.

Content stays read-only during execution. Edit JSON/assets, review and commit, run checks, rebuild frontend and Go executable, and redeploy. Content updates require a new executable.

## 7. Runtime and code organisation

Startup wires feature handlers and starts the server. Each feature handler calls its query interface; a JSONReader reads and decodes content for that request. Authored-content checks run in tests. There is no database, cache service, expiry or invalidation mechanism.

```text
cmd/portfolio/main.go
internal/{profile,experience,certifications}/ # feature models, inline content, validation and handlers
internal/projects/                # models, handlers, query interfaces and JSONReader
internal/explorer/                # Explorer model, handler and reader
internal/data/                    # authored JSON and embedding only
internal/httpserver/              # routes, static delivery and endpoint handlers
internal/httpserver/response/     # shared JSON responses
internal/httpserver/process/      # environment, listeners, signals and shutdown
web/embed.go
web/dist/                         # generated frontend build
web/public/images/                # curated runtime assets
web/src/main.tsx
web/src/app/                      # shell, navigation and routing
web/src/features/{profile,experience,projects,certifications}/
web/src/shared/                   # API helper and genuinely shared UI
web/package.json
web/package-lock.json
web/vite.config.ts
go.mod
README.md
PLAN.md
```

Keep existing checks beside the behavior they verify. HTTP handlers call domain queries for ordering, summary projection and lookup; listener and signal registration stay outside test runners; process helpers are checked without starting a server. Main explicitly wires dependencies. Share encoding/error helpers and reused UI. Add narrow interfaces only for concrete needs. No repository layer, query framework, DI framework, event bus or mediator is required. Only runtime assets under web/public/images belong in the frontend build.

## 8. API and errors

Endpoints:

- `GET /api/v1/profile`
- `GET /api/v1/experience`
- `GET /api/v1/projects`
- `GET /api/v1/projects/{slug}`
- `GET /api/v1/certifications`
- `GET /healthz`

The project list supplies ordered category/slug/title summaries for Explorer navigation. Detail responses supply structured content, diagram and gallery. List endpoints return arrays, including `[]` for empty collections. Unknown slugs return 404. Unknown API routes return JSON 404; unsupported methods return 405. Category-filter API endpoints from the original plan are unnecessary for the revised Explorer-only navigation and are removed from initial scope.

Use idiomatic `(value, error)` returns and `errors.Is`/`errors.As`; never compare error strings. Application errors do not contain HTTP status codes. Map invalid input to 400, missing project to 404, unexpected failures to safe 500 messages. Log internal diagnostics. Use one JSON error shape:

```json
{"error":{"code":"project_not_found","message":"Project not found."}}
```

No custom Result pattern is needed. Document endpoint examples in README.

## 9. React behavior

Load profile, experience, project summaries and certifications concurrently for the shell/section data. Fetch a selected project's details by slug. Each feature has loading, error and retry states; keep successful content and usable navigation visible if another request fails. Cancel or ignore superseded requests.

Use built-in React state and simple URL-based navigation; no global state/cache library is needed initially. The shared API helper checks status, validates response shapes and normalizes errors. Browser Back/Forward and direct links must restore the correct selected page. Folder expansion is local UI state, with selected project ancestors opened automatically.

Use a reusable diagram and gallery implementation so spacing, labels, images and responsive behavior stay consistent. Use original screenshots with explicit dimensions/aspect ratio, descriptive alternatives and sensible loading behavior. Do not add an unapproved carousel or extra navigation step to view a project's main information.

## 10. Build, routes and operations

Build frontend before Go:

1. In `web/`, run `npm ci`, type/focused frontend checks and `npm run build`.
2. At root, run `go test ./...` and `go vet ./...`.
3. Run `go build ./cmd/portfolio`.
4. Start and smoke-test the executable.

Go embeds portfolio JSON, HTML entry, built JS/CSS and curated public images. Node is build-time only. Production uses one process and listening port. Document commands first; an optional script may be a shortcut. Development may use Vite hot reload alongside Go.

Serve the React entry for `/` (including section query strings) and `/projects/:slug`. Missing assets return 404 rather than HTML. Unknown API routes return JSON 404. Other unknown page paths return HTTP 404. An unknown project slug initially receives the client shell with 200, then its API returns 404 and React shows not found; this remains an accepted client-rendering limitation.

Include sensible timeouts, request/error logs and graceful shutdown. Use platform-managed HTTPS. Hosting and domain remain portable decisions to settle before launch; no provider SDK or public URL is needed for the initial local build. No custom cache service/policy is required.

## 11. SEO and release requirements

Provide a generic title/description and update page titles in React. This is principally a hiring-process supplement reached through applications and professional profiles. JavaScript rendering and generic social previews are accepted initial tradeoffs. Prerendering, SSR, hydration, project-specific social previews and advanced SEO remain deferred.

Public launch requires approved biography/experience and at least two completed projects with honest contributions and outcomes. All four supplied repositories are included in the current plan. Source review and screenshots alone do not prove completion or runtime behavior; review the publication wording accordingly. Omit empty optional sections. Temporary content may aid development, but no fictional sample content or internal preview notes should appear in the public release.

## 12. Implementation sequence

1. Finalize content schema/API using the real CV, credentials and four repositories; retain provenance.
2. Prepare original screenshot assets and a faithful portrait cutout. Confirm the cutout at full size before composing the colored banner.
3. Build one end-to-end project detail flow from JSON through Go/API into React.
4. Build the shared shell, Portfolio Explorer, URL navigation and reusable project diagram.
5. Add About/banner, Experience and Certifications.
6. Add compact Rutuliukai and Quiz galleries inside the content column.
7. Complete feature loading/error/retry states, reduced motion, keyboard and mobile behavior.
8. Verify the standalone executable and document checks/remaining limits.

## 13. Acceptance and verification

- Backend: content/asset/diagram validation, category grouping, deterministic ordering, missing slugs and error-to-HTTP mapping; scoped in-memory Go checks and `go vet ./...`.
- Frontend: type checking and focused browser tests for initial loading, folder expansion, direct project selection, section navigation, Back/Forward, direct URL refresh, failed requests/retry and superseded requests. Normal flows use the real Go server.
- Routing: unknown API routes and missing images never receive the HTML shell; unknown pages and project not-found behavior work as specified.
- Visual: inspect every page at 360px, 768px and 1440px; compare against the selected frames. Check heading alignment, consistent diagram style, social icons, faithful portrait, readable banner contact text, compact galleries, long content and no horizontal overflow.
- Layout: screenshot galleries remain inside the main content column at every scroll position and viewport; nothing flows under Explorer.
- Accessibility: keyboard navigation, native link/button semantics, visible focus, selected state, reduced motion, readable contrast, image alternatives and diagram text equivalents.
- Maintainability: feature logic testable without HTTP/filesystem setup, independent packages and content/assets-only additions for projects.
- Deployment: run the built executable from an otherwise empty directory without source files, Node or a database. Record source revision, commands, results, screenshots and known limits.

Mark each check passed, failed or not run. These mockups have not satisfied implementation/runtime checks.

## 14. Remaining release inputs

- Final approval of publication copy, particularly personal contributions/outcomes for repository projects and the preferred LinkedIn URL.
- Faithful production portrait cutout derived from the original photo, not repeated AI restyling.
- Final responsive/motion review in the implemented interface.
- Hosting, public address and deployment configuration before launch.

