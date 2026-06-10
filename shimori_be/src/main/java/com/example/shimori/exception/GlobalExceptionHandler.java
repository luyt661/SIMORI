package com.example.shimori.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();

        if ("Email already exists".equals(message)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "field", "email",
                            "message", "Email đã tồn tại"
                    ));
        }

        if ("Username already exists".equals(message)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "field", "username",
                            "message", "Username đã tồn tại"
                    ));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message", message
                ));
    }
}