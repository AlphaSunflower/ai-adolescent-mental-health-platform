package com.xinyuzhilian.aiadolescentmentalhealthsystem;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.xinyuzhilian.aiadolescentmentalhealthsystem.mapper")
@EnableScheduling // 启用定时任务（用于热会话心跳保活）
public class AiAdolescentMentalHealthSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiAdolescentMentalHealthSystemApplication.class, args);
    }

}
