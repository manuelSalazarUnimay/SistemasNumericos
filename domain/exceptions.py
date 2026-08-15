class DomainException(Exception):
    """Excepción base para reglas de negocio."""
    pass

class InvalidBaseException(DomainException):
    pass

class InvalidSymbolException(DomainException):
    pass