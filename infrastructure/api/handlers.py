from flask import jsonify
from domain.exceptions import DomainException


def register_error_handlers(app):
    # Captura nuestras excepciones de negocio (Ej: Símbolos inválidos)
    @app.errorhandler(DomainException)
    def handle_domain_exception(error):
        return jsonify({
            "error": "Error de Validación",
            "message": str(error),
            "type": error.__class__.__name__
        }), 400

    # Captura errores de JSON mal formado o claves faltantes
    @app.errorhandler(KeyError)
    def handle_missing_json_keys(error):
        return jsonify({
            "error": "Petición Incorrecta",
            "message": f"Falta el parámetro requerido: {str(error)}"
        }), 400

    # Captura errores nativos de conversión de tipos (Ej: enviar letras en target_base)
    @app.errorhandler(ValueError)
    def handle_value_errors(error):
        return jsonify({
            "error": "Tipo de dato incorrecto",
            "message": str(error)
        }), 400