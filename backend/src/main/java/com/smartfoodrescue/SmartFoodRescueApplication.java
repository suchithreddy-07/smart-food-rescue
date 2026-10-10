package com.smartfoodrescue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class SmartFoodRescueApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(SmartFoodRescueApplication.class, args);
    }

    private static void loadDotenv() {
        Path[] searchPaths = new Path[] {
            Path.of(".env"),
            Path.of("backend/.env"),
            Path.of("../backend/.env")
        };
        for (Path path : searchPaths) {
            if (Files.isRegularFile(path)) {
                try {
                    for (String line : Files.readAllLines(path)) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int separatorIndex = trimmed.indexOf('=');
                        if (separatorIndex > 0) {
                            String key = trimmed.substring(0, separatorIndex).trim();
                            String value = trimmed.substring(separatorIndex + 1).trim();
                            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    break;
                } catch (IOException ignored) {}
            }
        }
    }
}
