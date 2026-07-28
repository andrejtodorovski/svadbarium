package com.svadbarium.venue.common.exception

class ConflictException(message: String) : RuntimeException(message)

class UnauthorizedException(message: String) : RuntimeException(message)

class NotFoundException(message: String) : RuntimeException(message)

class UnsupportedFileTypeException(message: String) : RuntimeException(message)

class FileTooLargeException(message: String) : RuntimeException(message)

class TooManyRequestsException(message: String) : RuntimeException(message)
