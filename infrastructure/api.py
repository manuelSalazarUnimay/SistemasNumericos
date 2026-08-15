from flask import Flask, request, jsonify
from flasgger import Swagger
from application.conversion_service import ConversionService


class FlaskAPI:
    def __init__(self):
        self.app = Flask(__name__)
        # Configuración básica de Swagger
        self.app.config['SWAGGER'] = {
            'title': 'API Didáctica de Bases Numéricas',
            'uiversion': 3
        }
        self.swagger = Swagger(self.app)
        self.service = ConversionService()
        self._setup_routes()

    def _setup_routes(self):
        @self.app.route('/api/explore/<int:base>', methods=['GET'])
        def explore(base):
            """
            Explora la estructura de una base numérica.
            ---
            parameters:
              - name: base
                in: path
                type: integer
                required: true
                description: La base numérica a explorar (ej. 2, 8, 16).
            responses:
              200:
                description: Estructura de la base.
              400:
                description: Error en la solicitud.
            """
            try:
                structure = self.service.explore_base(base)
                return jsonify({"base": base, "structure": structure}), 200
            except ValueError as e:
                return jsonify({"error": str(e)}), 400

        @self.app.route('/api/convert', methods=['POST'])
        def convert():
            """
            Convierte un número de una base a otra y muestra el paso a paso.
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
                      example: "1A"
                    source_base:
                      type: integer
                      example: 16
                    target_base:
                      type: integer
                      example: 2
            responses:
              200:
                description: Reporte completo didáctico de la conversión.
              400:
                description: Error de validación (símbolos inválidos, base incorrecta).
            """
            data = request.json
            try:
                # Extraemos los datos del JSON
                value = data['value']
                source_base = int(data['source_base'])
                target_base = int(data['target_base'])

                # Llamamos a nuestro servicio intacto
                report = self.service.process_full_conversion(value, source_base, target_base)

                # Transformamos el objeto 'Number' a diccionario para poder serializarlo a JSON
                report["number"] = {
                    "value": report["number"].value,
                    "base": report["number"].base
                }

                return jsonify(report), 200

            except ValueError as e:
                return jsonify({"error": str(e)}), 400
            except KeyError:
                return jsonify({"error": "Faltan parámetros en el JSON (value, source_base, target_base)"}), 400

    def run(self, host="0.0.0.0", port=5000, debug=True):
        self.app.run(host=host, port=port, debug=debug)