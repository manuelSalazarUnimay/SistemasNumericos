document.addEventListener('DOMContentLoaded', () => {
    // Referencias del DOM
    const form = document.getElementById('conversionForm');
    const baseFromSelect = document.getElementById('baseFrom');
    const baseToSelect = document.getElementById('baseTo');
    const resultBanner = document.getElementById('resultBanner');
    const resultValue = document.getElementById('resultValue');
    const stepsContainer = document.getElementById('stepsContainer');
    const errorAlert = document.getElementById('errorAlert');

    // Tabs
    const tabCalc = document.getElementById('tabCalc');
    const tabExplore = document.getElementById('tabExplore');
    const contentCalc = document.getElementById('contentCalc');
    const contentExplore = document.getElementById('contentExplore');

    // Contenido Exploración
    const exploreTitle = document.getElementById('exploreTitle');
    const baseExploreContent = document.getElementById('baseExploreContent');

    // Nombres amigables para bases comunes
    const baseNames = { 2: 'Binario', 3: 'Ternario', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' };

    // 1. Poblado seguro de Selects usando Nodos DOM
    function populateBases() {
        baseFromSelect.innerHTML = '';
        baseToSelect.innerHTML = '';

        for (let i = 2; i <= 16; i++) {
            const name = baseNames[i] ? ` (${baseNames[i]})` : '';

            const optFrom = document.createElement('option');
            optFrom.value = i;
            optFrom.textContent = `Base ${i}${name}`;
            baseFromSelect.appendChild(optFrom);

            const optTo = document.createElement('option');
            optTo.value = i;
            optTo.textContent = `Base ${i}${name}`;
            baseToSelect.appendChild(optTo);
        }

        baseFromSelect.value = "2";
        baseToSelect.value = "10";
    }

    // 2. Lógica de Pestañas (Tabs)
    function switchTab(activeTab, inactiveTab, activeContent, inactiveContent) {
        activeTab.classList.add('text-brandBlue', 'border-b-2', 'border-brandBlue', 'font-bold');
        activeTab.classList.remove('text-gray-500', 'hover:text-brandBlue', 'font-semibold');

        inactiveTab.classList.remove('text-brandBlue', 'border-b-2', 'border-brandBlue', 'font-bold');
        inactiveTab.classList.add('text-gray-500', 'hover:text-brandBlue', 'font-semibold');

        activeContent.classList.remove('hidden');
        activeContent.classList.add('block');

        inactiveContent.classList.remove('block');
        inactiveContent.classList.add('hidden');
    }

    tabCalc.addEventListener('click', () => switchTab(tabCalc, tabExplore, contentCalc, contentExplore));
    tabExplore.addEventListener('click', () => switchTab(tabExplore, tabCalc, contentExplore, contentCalc));

    // 3. Consumir Conversión
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        switchTab(tabCalc, tabExplore, contentCalc, contentExplore);
        stepsContainer.innerHTML = '<p class="text-center text-gray-500 py-6">Calculando pasos matemáticos...</p>';

        const value = document.getElementById('inputValue').value;
        try {
            const data = await convertNumber(value, baseFromSelect.value, baseToSelect.value);
            renderResults(data);
        } catch (err) {
            showError(err.message || 'Ocurrió un error al realizar la conversión.');
        }
    });

    // 4. Consumir Exploración
    baseFromSelect.addEventListener('change', async (e) => {
        const base = e.target.value;
        exploreTitle.textContent = `Estructura de Potencias (Base ${base})`;

        try {
            const data = await exploreBase(base);
            renderBaseExploration(data, base);
        } catch (err) {
            baseExploreContent.innerHTML = `<p class="col-span-2 text-red-500 text-center font-bold py-4">Error al cargar la exploración: ${escapeHtml(err.message)}</p>`;
        }
    });

    // --- Funciones de Renderizado ---

function renderResults(data) {
    // Si el backend responde dentro de un Array [ {...} ]
    if (Array.isArray(data)) data = data[0];

    resultValue.textContent = data.final_result || data.result || '---';
    resultBanner.classList.remove('hidden');

    let allSteps = [];

    // 1. Extraer y formatear términos si es Expansión por Potencias
    if (data.powers_method && Array.isArray(data.powers_method.terms)) {
        const base = data.number ? data.number.base : '';
        allSteps = data.powers_method.terms.map(t =>
            `Posición ${t.position}: Símbolo '${t.character}' (${t.digit_value}) × ${base}^${t.position} = ${t.subtotal}`
        );
    }
    // 2. Extraer y formatear pasadas si es Divisiones Sucesivas
    else if (data.divisions_method && Array.isArray(data.divisions_method.steps)) {
        allSteps = data.divisions_method.steps.map(s =>
            `${s.dividend} ÷ ${s.divisor} = ${s.quotient} | Residuo: ${s.remainder} ➔ Símbolo: '${s.symbol}'`
        );
    }
    // 3. Respaldo para arreglos de texto directo
    else if (Array.isArray(data.steps)) {
        allSteps = data.steps;
    }

    if (allSteps.length === 0) {
        stepsContainer.innerHTML = '<p class="text-gray-500 py-6 text-center">Explicación matemática no disponible.</p>';
        return;
    }

    stepsContainer.innerHTML = allSteps.map((stepText, index) => `
        <div class="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200 transition hover:border-brandYellow">
            <div class="flex-shrink-0 w-7 h-7 bg-brandYellow text-brandBlue-dark rounded-full font-bold flex items-center justify-center text-sm shadow">
                ${index + 1}
            </div>
            <div class="flex-1 text-sm font-mono text-slate-700 pt-1">${escapeHtml(String(stepText))}</div>
        </div>
    `).join('');
}

    function renderBaseExploration(data, base) {
        baseExploreContent.innerHTML = '';
        const baseInt = parseInt(base);

        // Generar símbolos permitidos de la base
        let symbols = [];
        for (let i = 0; i < baseInt; i++) {
            symbols.push(i < 10 ? i.toString() : String.fromCharCode(55 + i));
        }

        const symbolsDiv = `
            <div class="col-span-2 bg-brandYellow/10 border border-brandYellow/30 p-4 rounded-lg mb-4">
                <span class="block text-xs font-bold text-brandYellow-hover uppercase mb-1">Dígitos Permitidos (Símbolos de la base)</span>
                <span class="text-brandBlue-dark font-mono text-lg tracking-widest">${symbols.join(', ')}</span>
            </div>
        `;

        if (!Array.isArray(data) || data.length === 0) {
            baseExploreContent.innerHTML = symbolsDiv + '<p class="col-span-2 text-gray-500 mt-2 text-center">No hay datos de estructura para mostrar.</p>';
            return;
        }

        // Mapeo adaptado al controlador original (Array de objetos con "base_representation" y "decimal_value")
        const itemsHTML = data.map(item => `
            <div class="bg-white p-3 rounded shadow-sm border ${item.is_power_of_base ? 'border-l-4 border-l-brandBlue border-slate-200' : 'border-slate-200'} flex justify-between items-center my-1">
                <span class="text-slate-600 font-medium">
                    Base ${base}${item.power_index !== undefined && item.power_index !== null ? `<sup class="font-bold text-brandBlue">${item.power_index}</sup>` : ''}
                </span>
                <div class="text-right">
                    <span class="font-bold text-brandBlue text-lg">${escapeHtml(String(item.base_representation))}</span>
                    <span class="block text-xs text-slate-400">Decimal: ${item.decimal_value}</span>
                </div>
            </div>
        `).join('');

        baseExploreContent.innerHTML = symbolsDiv + itemsHTML;
    }

    // Funciones Auxiliares
    function showError(message) {
        resultBanner.classList.add('hidden');
        stepsContainer.innerHTML = '';
        if (errorAlert) {
            errorAlert.textContent = message;
            errorAlert.classList.remove('hidden');
        }
    }

    function hideError() {
        if (errorAlert) {
            errorAlert.classList.add('hidden');
            errorAlert.textContent = '';
        }
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Inicializar aplicación
    populateBases();
    baseFromSelect.dispatchEvent(new Event('change'));
});