# AGENTS.md — `apps/android`

> 面向 AI 编码助手的 Android 客户端工作区速查。动手前请同时参阅根 [AGENTS.md](../../AGENTS.md)。
>
> **文档自更新**：当本工作区的构建脚本 / AGP 版本 / 依赖 / 权限 / 约定发生变化，或你从用户对话中沉淀到新约束时，**可直接更新本文件或根 README / AGENTS**。就近修改、先事实后文档、保持锚点准确。详见根 [AGENTS.md](../../AGENTS.md) 第「五、文档自更新」节。

## 一、工作区基本事实

- 包名：`@ai-adolescent-mental-health/android`
- 语言：Kotlin
- 构建系统：Gradle Wrapper（`gradlew` / `gradlew.bat`）
- AGP：`8.12.0`
- `compileSdk` / `targetSdk`：`36`
- `minSdk`：`24`

## 二、关键文件

- 根构建脚本：`build.gradle.kts`
- 应用模块：`app/build.gradle.kts`
- 本地 SDK 路径：`local.properties`（**不入库**，由 Android Studio 首次打开时生成；CI 可写入 `sdk.dir=...`）
- 版本目录：`gradle/libs.versions.toml`（若存在，请优先在此声明依赖版本）

## 三、命令

通过 monorepo 根目录：

```bash
pnpm --filter @ai-adolescent-mental-health/android build   # gradlew build
pnpm --filter @ai-adolescent-mental-health/android test    # gradlew test
pnpm --filter @ai-adolescent-mental-health/android clean   # gradlew clean
pnpm test:android                                          # 同上 test 的快捷方式
```

直接使用 Gradle：

```bash
./gradlew assembleDebug
./gradlew app:installDebug
./gradlew test
```

## 四、AI 约束

1. **不提交签名材料**：`*.keystore`、`*.jks`、`keystore.properties`、`release/signingConfigs` 相关真实值一律不入库。如需在 CI 签名，使用环境变量注入。
2. **`local.properties` 永远不入库**：它包含本机 Android SDK 路径，属开发者机器私有。
3. **Gradle Wrapper 版本**：`gradle/wrapper/gradle-wrapper.properties` 指定的版本与 AGP `8.12.0` 绑定，升级需整体评估，不要单点修改。
4. **AGP / Kotlin 版本对齐**：两者有严格兼容矩阵，新增插件前确认兼容。
5. **依赖声明位置**：新依赖放入 `app/build.gradle.kts` 的 `dependencies {}`；如存在 `libs.versions.toml`，优先通过版本目录管理。
6. **`minSdk=24` 不要随意降低**：降低会影响既有 API 兼容性假设；升高需与产品确认可接受的用户面覆盖。
7. **网络明文配置**：若需连接本地后端（`http://10.0.2.2:8080`），应通过 `network_security_config.xml` 限定 debug 构建，禁止对 release 放开。
8. **权限声明**：新增敏感权限（定位、录音、通讯录等）前须在 PR 中说明用途；涉及隐私需评估合规。

## 五、与其他工作区的协作

- 访问后端 API：本地调试时 `http://10.0.2.2:8080` 指向宿主机的 `localhost:8080`（后端默认端口）。
- 登录体系：复用后端 Sa-Token + JWT；token 获取与刷新逻辑请与后端 `user` 域对齐。

## 六、测试

- 单元测试：`src/test/`；仪器测试：`src/androidTest/`。
- Monorepo 级 `pnpm test` 会串入 `gradlew test`；无头 CI 环境请确保不跑 `connectedAndroidTest`。
