# Repository Guidelines

## Project Structure & Module Organization
- React web lives in `src/` (pages, components, `lib/analytics`, theme) with entry points `src/index.js` and `src/App.js`; static assets are in `public/`, build artifacts in `build/`.
- Flutter app resides in `lib/` with platform scaffolding under `android/`, `ios/`, `macos/`, `linux/`, `windows/`, `web/`, and shared assets in `assets/`; Flutter tests live in `test/`.
- Runbooks and integration notes are at the repo root (`README.md`, `DEPLOYMENT.md`, `BACKEND_INTEGRATION.md`, `GOOGLE_AUTH_SETUP.md`).

## Build, Test, and Development Commands
- React: `npm install`, `npm start`, `npm run build`, `npm test -- --watch=false` (CRA/Jest + React Testing Library).
- Flutter: `flutter pub get`, `flutter run -d chrome` (or another device), `flutter test`, `flutter build web`/`flutter build apk`.
- Use Node 16+ and Flutter 3.x; clear cached outputs (`rm -rf build`) if switching branches or toolchains.

## Coding Style & Naming Conventions
- JavaScript/JSX: 2-space indent, single quotes, functional components + hooks preferred. Component/file names PascalCase (`SearchPage.jsx`), helpers camelCase. Keep side effects in hooks and keep components small.
- Dart: 2-space indent, prefer `const` widgets, wrap lines near 100 chars. Files are snake_case; widgets/classes PascalCase; private members start with `_`.
- Linting via CRA ESLint defaults; run `npm test` for Jest checks and `flutter analyze` before review.

## Testing Guidelines
- React: colocate `*.test.js` with components; cover user flows using React Testing Library (render, trigger events, assert DOM). Mock network calls with Jest/axios mocks.
- Flutter: place `*_test.dart` in `test/`; prefer widget tests for navigation and state. Stub HTTP clients instead of hitting real services.
- Target critical paths (auth, search, reviews, analytics event firing) and keep tests deterministic.

## Commit & Pull Request Guidelines
- Commits use short, imperative summaries (e.g., `Add academic profile section`); group related changes.
- PRs should include a concise summary, scope, linked issues, and env/config notes. Attach before/after screenshots or screen recordings for UI updates. Mention any analytics events added/changed. Confirm `npm test` and `flutter test` ran.

## Security & Configuration Tips
- Keep secrets and API keys in environment files or platform-specific config; never commit them. Use placeholders in docs/examples.
- Before deployment, verify analytics credentials and routing domains match `CNAME`/`DEPLOYMENT.md`. Run a smoke build (`npm run build` and `flutter build web`) to catch env mismatches early.
