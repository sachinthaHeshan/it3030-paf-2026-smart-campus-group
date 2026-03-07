# Use Java 21
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy backend folder contents
COPY . .

# Build the app
RUN ./mvnw clean package -DskipTests

# Expose port (Railway will override)
EXPOSE 8080

# Start the app
CMD ["java", "-jar", "target/smartcampus-0.0.1-SNAPSHOT.jar"]