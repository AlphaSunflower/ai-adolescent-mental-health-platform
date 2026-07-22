# syntax=docker/dockerfile:1.7

# ===== Stage 1: Build =====
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# 先复制 Maven 配置，利用缓存
COPY apps/backend/pom.xml ./apps/backend/pom.xml
COPY apps/backend/.mvn ./apps/backend/.mvn
COPY apps/backend/mvnw ./apps/backend/mvnw
COPY apps/backend/mvnw.cmd ./apps/backend/mvnw.cmd

# 下载依赖（利用 Docker 层缓存）
RUN cd apps/backend && ./mvnw dependency:go-offline -B -q || true

# 复制源码
COPY apps/backend/src ./apps/backend/src

# 构建（跳过测试，生产构建在 CI 中已运行过）
RUN cd apps/backend && ./mvnw clean package -DskipTests -B -q

# ===== Stage 2: Runtime =====
FROM eclipse-temurin:17-jre-alpine AS runtime

RUN addgroup -S -g 1001 app 2>/dev/null || true \
  && adduser -S -u 1001 -G app app

WORKDIR /app

# 从构建阶段复制 JAR
COPY --from=build /workspace/apps/backend/target/app.jar ./app.jar

# 创建日志目录
RUN mkdir -p /app/logs && chown -R app:app /app

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
