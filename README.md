# AI Adolescent Mental Health Platform

This repository is organized as a `pnpm + Turborepo` monorepo.

## Prerequisites

- Node.js 24+
- pnpm 10.33.0+
- Java 17 toolchain for the Spring Boot backend
- Android SDK configured locally for `apps/android/local.properties`
- WeChat DevTools for the mini program in `apps/wechat-miniapp`

## Workspace Layout

- `apps/web-admin`: Vue 3 + Vite admin web app
- `apps/backend`: Spring Boot backend service
- `apps/android`: Android client
- `apps/wechat-miniapp`: WeChat mini program
- `apps/wechat-functions`: WeChat cloud functions
- `infra/sql`: shared SQL assets kept outside the workspaces

## Common Commands

Install dependencies from the repository root:

```bash
pnpm install
```

Run the main monorepo tasks:

```bash
pnpm dev
pnpm build
pnpm test
pnpm typecheck
pnpm clean
```

Run a single workspace task:

```bash
pnpm --filter @ai-adolescent-mental-health/web-admin dev
pnpm --filter @ai-adolescent-mental-health/backend test
pnpm --filter @ai-adolescent-mental-health/android build
```

## Notes

- `apps/backend` uses the Maven wrapper. Make sure `JAVA_HOME` points to a Java 17 compatible JDK.
- `apps/android` uses the Gradle wrapper. Create `apps/android/local.properties` locally if Android Studio has not generated it yet.
- `apps/wechat-miniapp` does not fake a CLI build. Open that workspace directly in WeChat DevTools.
- `apps/wechat-functions` is installed and locked through the root `pnpm-lock.yaml`.
