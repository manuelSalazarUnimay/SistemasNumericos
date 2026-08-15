from infrastructure.api.app_factory import create_app

if __name__ == "__main__":
    app = create_app()

    print("==================================================")
    print("🚀 Servidor API iniciado exitosamente.")
    print("📖 Visita Swagger UI en: http://127.0.0.1:5000/apidocs")
    print("==================================================")

    app.run(host="0.0.0.0", port=5000, debug=True)