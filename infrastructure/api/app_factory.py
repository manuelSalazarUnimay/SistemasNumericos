from flask import Flask
from flasgger import Swagger
from infrastructure.api.controllers import api_blueprint
from infrastructure.api.handlers import register_error_handlers


def create_app():
    """Patrón Factory para ensamblar la aplicación."""
    app = Flask(__name__)

    # Configuración de Swagger
    app.config['SWAGGER'] = {
        'title': 'API Didáctica de Bases Numéricas',
        'uiversion': 3
    }
    Swagger(app)

    # Registrar el manejo de errores global
    register_error_handlers(app)

    # Registrar los controladores (rutas)
    app.register_blueprint(api_blueprint)

    return app