package com.spareparts.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ModuleNotEnabledException extends RuntimeException {
    public ModuleNotEnabledException(String moduleCode) {
        super("Feature Locked: Module '" + moduleCode + "' is not enabled or subscription expired.");
    }
}
