
# Stage 1: Build
FROM maven:3.9.4-eclipse-temurin-17 AS build

WORKDIR /app

# Copy only pom.xml first (cache dependencies)
COPY spare-parts-shop/pom.xml .
RUN mvn dependency:go-offline -B

# Then copy source code
COPY spare-parts-shop/src ./src
RUN mvn clean package -DskipTests -Dmaven.test.skip=true

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine

# Add a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Add JVM options for better performance in container
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
