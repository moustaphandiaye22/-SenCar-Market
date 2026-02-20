package com.sencarmarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SenCarMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(SenCarMarketApplication.class, args);
    }
}
