# Stage 1: build the Angular app
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: build the Spring Boot jar, with Angular's output copied into static resources
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /backend
COPY backend/gradlew ./
COPY backend/gradle ./gradle
COPY backend/build.gradle.kts backend/settings.gradle.kts ./
RUN chmod +x gradlew && ./gradlew --version
COPY backend/src ./src
COPY --from=frontend-build /frontend/dist/svadbarium/browser ./src/main/resources/static
RUN ./gradlew bootJar -x test

# Stage 3: slim runtime
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY --from=backend-build /backend/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
