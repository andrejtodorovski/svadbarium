package com.svadbarium.venue.common.exception

import com.svadbarium.venue.common.dto.ErrorResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.multipart.MaxUploadSizeExceededException

@RestControllerAdvice
class ApiExceptionHandler {

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(e: NotFoundException) =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse(e.message ?: "Not found"))

    @ExceptionHandler(ConflictException::class)
    fun handleConflict(e: ConflictException) =
        ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse(e.message ?: "Conflict"))

    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorized(e: UnauthorizedException) =
        ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ErrorResponse(e.message ?: "Unauthorized"))

    @ExceptionHandler(UnsupportedFileTypeException::class)
    fun handleUnsupportedFileType(e: UnsupportedFileTypeException) =
        ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(ErrorResponse(e.message ?: "Unsupported file type"))

    @ExceptionHandler(FileTooLargeException::class, MaxUploadSizeExceededException::class)
    fun handleFileTooLarge(e: Exception) =
        ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(ErrorResponse(e.message ?: "File too large"))

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException) =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ErrorResponse(e.message ?: "Bad request"))
}
