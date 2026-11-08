# 빌드 컨텍스트는 저장소 루트다 (content/ 를 지식원으로 함께 패키징하기 위해)
#   docker build -f server/Dockerfile -t portfolio-chat .

FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY content ./content
COPY server ./server
WORKDIR /workspace/server
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre
RUN groupadd --system app && useradd --system --gid app --uid 1001 app
WORKDIR /app
COPY --from=build /workspace/server/build/libs/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
