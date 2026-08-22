const API_BASE_URL = '/api';

async function convertNumber(value, fromBase, toBase) {
    const url = `${API_BASE_URL}/convert/${encodeURIComponent(value.trim())}/from/${fromBase}/to/${toBase}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Error 404: El endpoint no existe o el servidor devolvió HTML.`);
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la conversión');
    }
    return data;
}

async function exploreBase(base) {
    const response = await fetch(`${API_BASE_URL}/explore/${base}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Error al explorar la base ${base}`);
    }
    return data;
}