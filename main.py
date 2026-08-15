from infrastructure.api import FlaskAPI

# from infrastructure.cli import CLI  <-- Ya no usamos la consola

if __name__ == "__main__":
    api = FlaskAPI()

    print("==================================================")
    print("🚀 Servidor API iniciado exitosamente.")
    print("📖 Visita Swagger UI en: http://127.0.0.1:5000/apidocs")
    print("==================================================")

    api.run()