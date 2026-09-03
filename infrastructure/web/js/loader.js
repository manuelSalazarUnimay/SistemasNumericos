async function loadComponent(id, file) {
    try {
        const response = await fetch(`components/${file}`);
        if (response.ok) {
            document.getElementById(id).innerHTML = await response.text();
        } else {
            console.error(`No se pudo cargar ${file}: HTTP ${response.status}`);
        }
    } catch (err) {
        console.error(`Error de red al cargar ${file}:`, err);
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Error cargando el script ${src}`));
        document.body.appendChild(script);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Inyectar HTML de los componentes en paralelo
    await Promise.all([
        loadComponent('header-root', 'header.html'),
        loadComponent('sidebar-root', 'sidebar.html'),
        loadComponent('form-root', 'conversion-form.html'),
        loadComponent('results-root', 'results-panel.html')
    ]);

    // 2. Cargar scripts JS secuencialmente
    try {
        await loadScript('js/api.js');
        await loadScript('js/main.js');

        // 3. Inicializar la app cuando el DOM ya tiene los elementos renderizados
        if (typeof initApp === 'function') {
            initApp();
        }
    } catch (error) {
        console.error("Error al inicializar la lógica de negocio:", error);
    }
});