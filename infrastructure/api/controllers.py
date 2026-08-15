from flask import Blueprint, request, jsonify
from application.conversion_service import ConversionService

# Equivalente a @RestController en Spring
api_blueprint = Blueprint('api', __name__)
service = ConversionService()


@api_blueprint.route('/api/explore/<int:base>', methods=['GET'])
def explore(base):
    """
    Explora la estructura de una base numérica.
    ---
    parameters:
      - name: base
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Colección de las transiciones clave de la base.
    """
    raw_structure = service.explore_base(base)

    # Transformamos el resultado en una colección (Array) limpia,
    # omitiendo los saltos visuales de la consola y dejando solo los datos útiles.
    coleccion = []
    for item in raw_structure:
        if not item.get("is_gap"):
            coleccion.append({
                "decimal_value": item["decimal"],
                "base_representation": item["base_repr"],
                "is_power_of_base": item["is_power"],
                "power_index": item["power_idx"]
            })

    # Retornamos el Array directamente
    return jsonify(coleccion), 200


@api_blueprint.route('/api/convert', methods=['POST'])
def convert():
    """
    Convierte un número de una base a otra.
    ---
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - value
            - source_base
            - target_base
          properties:
            value:
              type: string
            source_base:
              type: integer
            target_base:
              type: integer
    responses:
      200:
        description: Reporte de conversión.
    """
    # Equivalente a @RequestBody en Java. 'silent=True' evita que Flask
    # lance un error fatal si falta el header Content-Type.
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Petición Inválida",
            "message": "Se esperaba un cuerpo JSON en la petición."
        }), 400

    # Usamos .get() de forma segura para validar qué viene en el JSON
    value = data.get('value')
    source_base = data.get('source_base')
    target_base = data.get('target_base')

    if value is None or source_base is None or target_base is None:
        return jsonify({
            "error": "Parámetros incompletos",
            "message": "Los campos 'value', 'source_base' y 'target_base' son obligatorios."
        }), 400

    try:
        # Forzamos los tipos para evitar errores si mandan strings numéricos
        source_base = int(source_base)
        target_base = int(target_base)

        report = service.process_full_conversion(str(value), source_base, target_base)

        # Mapeo de DTO para la respuesta JSON
        report["number"] = {
            "value": report["number"].value,
            "base": report["number"].base
        }

        return jsonify(report), 200

    except ValueError as e:
        # Captura si source_base o target_base no se pueden convertir a enteros
        return jsonify({"error": "Tipo de dato incorrecto", "message": str(e)}), 400