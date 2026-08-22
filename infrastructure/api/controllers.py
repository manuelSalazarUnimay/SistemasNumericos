from flask import Blueprint, jsonify
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


# Usamos GET en lugar de POST, y definimos las variables en el Path
@api_blueprint.route('/api/convert/<string:value>/from/<int:source_base>/to/<int:target_base>', methods=['GET'])
def convert(value: str, source_base: int, target_base: int):
    """
    Convierte un número de una base a otra usando parámetros en la URL.
    ---
    parameters:
      - name: value
        in: path
        type: string
        required: true
        description: El valor que deseas convertir (ej. A05)
      - name: source_base
        in: path
        type: integer
        required: true
        description: La base numérica de origen (ej. 16)
      - name: target_base
        in: path
        type: integer
        required: true
        description: La base numérica destino (ej. 2)
    responses:
      200:
        description: Reporte detallado de la conversión.
      400:
        description: Error de validación (símbolos o bases inválidas).
    """
    try:
        # Ya no necesitamos request.get_json(), los parámetros llegan directo a la función
        report = ConversionService.process_full_conversion(value, source_base, target_base)

        # Mapeo de DTO para la respuesta JSON
        report["number"] = {
            "value": report["number"].value,
            "base": report["number"].base
        }

        return jsonify(report), 200

    except ValueError as e:
        return jsonify({"error": "Tipo de dato incorrecto", "message": str(e)}), 400