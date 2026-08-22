import os
from flask import Flask, send_from_directory
from flasgger import Swagger
from flask_cors import CORS

from infrastructure.api.controllers import api_blueprint
from infrastructure.api.handlers import register_error_handlers


def create_app():
    """Patrón Factory para ensamblar la aplicación con Swagger y Web UI."""

    # 1. Configurar rutas para la carpeta 'web'
    # Obtenemos la ruta absoluta de 'app_factory.py' y bajamos un nivel para encontrar 'web'
    base_dir = os.path.dirname(os.path.abspath(__file__))
    web_folder = os.path.join(base_dir, '..', 'web')

    # Inicializamos Flask apuntando a la carpeta de tu frontend
    app = Flask(__name__, static_folder=web_folder, static_url_path='')

    # Habilitamos CORS (Opcional pero recomendado para APIs)
    CORS(app)

    # 2. Configuración de Swagger
    app.config['SWAGGER'] = {
        'title': 'API Didáctica de Bases Numéricas',
        'uiversion': 3
    }
    Swagger(app)

    # 3. Ruta para servir la Interfaz Gráfica Custom
    @app.route('/')
    def serve_ui():
        """Sirve el archivo index.html cuando se entra a la raíz del sitio."""
        return send_from_directory(app.static_folder, 'index.html')

    # 4. Registrar el manejo de errores global y controladores
    register_error_handlers(app)
    app.register_blueprint(api_blueprint)

    return app