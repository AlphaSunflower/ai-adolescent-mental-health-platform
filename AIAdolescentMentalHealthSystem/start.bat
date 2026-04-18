@echo off
cd /d "E:\Project\AIAdolescentMentalHealth\AIAdolescentMentalHealthSystem"
echo Starting Spring Boot...
call mvnw.cmd spring-boot:run > backend.log 2>&1
