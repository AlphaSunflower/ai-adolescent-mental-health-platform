# syntax=docker/dockerfile:1.7

FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /workspace/apps/backend

COPY apps/backend/.mvn .mvn
COPY apps/backend/mvnw apps/backend/pom.xml ./

RUN --mount=type=cache,target=/root/.m2 \
  sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline

COPY apps/backend/src ./src

RUN --mount=type=cache,target=/root/.m2 \
  ./mvnw -B clean package -DskipTests -DfinalName=app

FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache curl \
  && addgroup -S spring \
  && adduser -S spring -G spring

COPY --from=build /workspace/apps/backend/target/app.jar app.jar

USER spring

ENV JAVA_OPTS=""

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
