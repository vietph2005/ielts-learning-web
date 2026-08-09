# Step 1: Build jar file
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Step 2: Run application
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install praat for speaking test analysis
RUN apt-get update && apt-get install -y praat && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

# Copy the praat scripts into the container
COPY src/main/java/web/ielts/Test/*.praat /app/praat-scripts/

# Set env variables to override default Windows paths
ENV PRAAT_PATH=praat
ENV PRAAT_SCRIPT_PATH=/app/praat-scripts/script.praat
ENV STRESS_ANALYSIS_SCRIPT_PATH=/app/praat-scripts/stressAnalysis.praat
ENV INTONATION_SCRIPT_PATH=/app/praat-scripts/script_intonation.praat
ENV GET_DURATION_SCRIPT_PATH=/app/praat-scripts/GetDuration.praat

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]