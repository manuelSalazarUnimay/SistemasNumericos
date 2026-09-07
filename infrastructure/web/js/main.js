function initApp() {
    // Captura de Nodos del DOM
    const form = document.getElementById('conversionForm');
    const inputVal = document.getElementById('inputValue');
    const baseFromSelect = document.getElementById('baseFrom');
    const baseToSelect = document.getElementById('baseTo');
    const btnReset = document.getElementById('btnReset');
    const btnSwap = document.getElementById('btnSwap'); // Capturado dentro del scope de la app

    const resultBanner = document.getElementById('resultBanner');
    const resultValue = document.getElementById('resultValue');
    const stepsContainer = document.getElementById('stepsContainer');
    const errorAlert = document.getElementById('errorAlert');

    // Tabs
    const tabCalc = document.getElementById('tabCalc');
    const tabExploreFrom = document.getElementById('tabExploreFrom');
    const tabExploreTo = document.getElementById('tabExploreTo');

    const contentCalc = document.getElementById('contentCalc');
    const contentExploreFrom = document.getElementById('contentExploreFrom');
    const contentExploreTo = document.getElementById('contentExploreTo');

    const baseNames = { 2: 'Binario', 3: 'Ternario', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' };

    // Poblado de Selects
    function populateBases() {
        if (!baseFromSelect || !baseToSelect) return;

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

        baseFromSelect.value = "10";
        baseToSelect.value = "2";
    }

    // Pestañas
    const tabs = [
        { btn: tabCalc, content: contentCalc },
        { btn: tabExploreFrom, content: contentExploreFrom },
        { btn: tabExploreTo, content: contentExploreTo }
    ];

    function activateTab(selectedTab) {
        tabs.forEach(t => {
            if (!t.btn || !t.content) return;
            if (t.btn === selectedTab.btn) {
                t.btn.classList.add('text-brandBlue', 'border-b-2', 'border-brandBlue', 'font-bold');
                t.btn.classList.remove('text-slate-500', 'hover:text-brandBlue', 'font-semibold');
                t.content.classList.remove('hidden');
                t.content.classList.add('block');
            } else {
                t.btn.classList.remove('text-brandBlue', 'border-b-2', 'border-brandBlue', 'font-bold');
                t.btn.classList.add('text-slate-500', 'hover:text-brandBlue', 'font-semibold');
                t.content.classList.remove('block');
                t.content.classList.add('hidden');
            }
        });
    }

    if (tabCalc) tabCalc.addEventListener('click', () => activateTab(tabs[0]));
    if (tabExploreFrom) {
        tabExploreFrom.addEventListener('click', () => {
            activateTab(tabs[1]);
            loadBaseExploration(baseFromSelect.value, 'From');
        });
    }
    if (tabExploreTo) {
        tabExploreTo.addEventListener('click', () => {
            activateTab(tabs[2]);
            loadBaseExploration(baseToSelect.value, 'To');
        });
    }

    // Evento Formulario: Convertir usando API real (convertNumber)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();
            activateTab(tabs[0]);
            stepsContainer.innerHTML = '<p class="text-center text-slate-500 py-6">Calculando pasos matemáticos...</p>';

            try {
                const data = await convertNumber(inputVal.value, baseFromSelect.value, baseToSelect.value);
                renderResults(data);
            } catch (err) {
                showError(err.message || 'Error al procesar la conversión.');
            }
        });
    }

    // Evento: Invertir Bases y Resultado (AHORA DENTRO DEL SCOPE DE initApp)
    if (btnSwap) {
        btnSwap.addEventListener('click', () => {
            // 1. Intercambiar los valores seleccionados de las bases
            const tempBase = baseFromSelect.value;
            baseFromSelect.value = baseToSelect.value;
            baseToSelect.value = tempBase;

            // 2. Si ya se calculó un resultado previo, moverlo al campo de origen
            const quickDisplay = document.getElementById('quickResultDisplay');
            if (quickDisplay && quickDisplay.textContent !== '---') {
                inputVal.value = quickDisplay.textContent.trim();
            }

            // 3. Actualizar tarjetas visuales de posición
            updateBitPreview();

            // 4. Re-ejecutar la conversión automáticamente si el input tiene valor
            if (inputVal && inputVal.value.trim() !== '') {
                form?.dispatchEvent(new Event('submit'));
            }
        });
    }

    // Evento: Nueva Conversión (Limpiar Campos)
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (inputVal) {
                inputVal.value = '';
                inputVal.focus();
            }
            if (resultBanner) resultBanner.classList.add('hidden');
            if (resultValue) resultValue.textContent = '---';

            const quickDisplay = document.getElementById('quickResultDisplay');
            const quickBase = document.getElementById('quickResultBase');
            if (quickDisplay) quickDisplay.textContent = '---';
            if (quickBase) quickBase.textContent = 'Esperando conversión...';

            if (stepsContainer) {
                stepsContainer.innerHTML = `
                    <div class="text-center py-12 text-slate-400 italic">
                        Ingresa un número y presiona "Convertir" para ver la resolución detallada.
                    </div>`;
            }
            hideError();
            activateTab(tabs[0]);
            updateBitPreview();
        });
    }

    async function loadBaseExploration(base, target) {
        const titleEl = target === 'From' ? document.getElementById('exploreTitleFrom') : document.getElementById('exploreTitleTo');
        const containerEl = target === 'From' ? document.getElementById('baseExploreContentFrom') : document.getElementById('baseExploreContentTo');

        if (titleEl) titleEl.textContent = `Estructura de Potencias (Base ${base})`;
        try {
            const data = await exploreBase(base);
            renderBaseExploration(data, base, containerEl);
        } catch (err) {
            if (containerEl) containerEl.innerHTML = `<p class="col-span-2 text-red-500 text-center font-bold py-4">Error al cargar la estructura.</p>`;
        }
    }

    function renderResults(data) {
        if (Array.isArray(data)) data = data[0];
        const finalResult = data.final_result || data.result || '---';

        if (resultValue) resultValue.textContent = finalResult;
        if (resultBanner) resultBanner.classList.remove('hidden');

        const resultFromValue = document.getElementById('resultFromValue');
        if (resultFromValue) resultFromValue.textContent = inputVal.value;

        const quickDisplay = document.getElementById('quickResultDisplay');
        const quickBase = document.getElementById('quickResultBase');
        const baseToText = baseToSelect?.options[baseToSelect.selectedIndex]?.text || '';

        if (quickDisplay) quickDisplay.textContent = finalResult;
        if (quickBase) quickBase.textContent = baseToText;

        let allSteps = [];
        if (data.powers_method && Array.isArray(data.powers_method.terms)) {
            const base = data.number ? data.number.base : '';
            allSteps = data.powers_method.terms.map(t =>
                `Posición ${t.position}: Símbolo '${t.character}' (${t.digit_value}) × ${base}^${t.position} = ${t.subtotal}`
            );
        } else if (data.divisions_method && Array.isArray(data.divisions_method.steps)) {
            allSteps = data.divisions_method.steps.map(s =>
                `${s.dividend} ÷ ${s.divisor} = ${s.quotient} | Residuo: ${s.remainder} ➔ Símbolo: '${s.symbol}'`
            );
        } else if (Array.isArray(data.steps)) {
            allSteps = data.steps;
        }

        if (allSteps.length === 0) {
            stepsContainer.innerHTML = '<p class="text-slate-500 py-6 text-center">Explicación matemática no disponible.</p>';
            return;
        }

        stepsContainer.innerHTML = allSteps.map((stepText, index) => `
            <div class="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-brandYellow transition">
                <div class="flex-shrink-0 w-7 h-7 bg-brandYellow text-brandBlue-dark rounded-full font-bold flex items-center justify-center text-sm shadow">
                    ${index + 1}
                </div>
                <div class="flex-1 text-sm font-mono text-slate-700 pt-1">${escapeHtml(String(stepText))}</div>
            </div>
        `).join('');
    }

    function renderBaseExploration(data, base, container) {
        if (!container) return;
        container.innerHTML = '';
        const baseInt = parseInt(base);

        let symbols = [];
        for (let i = 0; i < baseInt; i++) {
            symbols.push(i < 10 ? i.toString() : String.fromCharCode(55 + i));
        }

        const symbolsDiv = `
            <div class="col-span-2 bg-brandYellow/10 border border-brandYellow/30 p-4 rounded-lg mb-4">
                <span class="block text-xs font-bold text-brandYellow-hover uppercase mb-1">Dígitos Permitidos</span>
                <span class="text-brandBlue-dark font-mono text-lg tracking-widest">${symbols.join(', ')}</span>
            </div>
        `;

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = symbolsDiv + '<p class="col-span-2 text-slate-500 text-center">No hay datos para mostrar.</p>';
            return;
        }

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

        container.innerHTML = symbolsDiv + itemsHTML;
    }

    function showError(msg) {
        if (resultBanner) resultBanner.classList.add('hidden');
        if (stepsContainer) stepsContainer.innerHTML = '';
        if (errorAlert) {
            errorAlert.textContent = msg;
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

    function updateBitPreview() {
        const bitPreview = document.getElementById('bitPreview');
        const baseBadge = document.getElementById('baseBadge');

        if (!bitPreview || !inputVal || !baseFromSelect) return;
        if (baseBadge) baseBadge.textContent = `Base ${baseFromSelect.value}`;

        const rawValue = inputVal.value.trim().toUpperCase();
        if (!rawValue) {
            bitPreview.innerHTML = '<span class="text-xs text-slate-400 italic">Escribe un número para previsualizar sus posiciones</span>';
            return;
        }

        const base = parseInt(baseFromSelect.value);
        const chars = rawValue.split('');
        const len = chars.length;

        bitPreview.innerHTML = chars.map((char, idx) => {
            const power = len - 1 - idx;
            const digitVal = parseInt(char, base);
            const isValid = !isNaN(digitVal);
            const isActive = isValid && digitVal > 0;

            const cardStyle = isActive
                ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                : 'bg-slate-100 border border-slate-300 text-slate-400 opacity-60';

            return `
                <div class="flex flex-col items-center justify-center w-11 h-14 rounded-lg font-mono transition-all transform hover:scale-105 ${cardStyle}">
                    <span class="text-base font-black leading-none mb-1">${char}</span>
                    <span class="text-[10px] leading-none opacity-80">${base}<sup>${power}</sup></span>
                </div>
            `;
        }).join('');
    }

    // Event Listeners para Entrada y Ejemplos
    inputVal?.addEventListener('input', updateBitPreview);
    baseFromSelect?.addEventListener('change', updateBitPreview);

    document.querySelectorAll('.quick-sample').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.currentTarget.dataset.val;
            const from = e.currentTarget.dataset.from;
            const to = e.currentTarget.dataset.to;

            if (inputVal) inputVal.value = val;
            if (baseFromSelect) baseFromSelect.value = from;
            if (baseToSelect) baseToSelect.value = to;

            updateBitPreview();
            form?.dispatchEvent(new Event('submit'));
        });
    });

    // Ejecución inicial de poblado
    populateBases();
}

// TRANSICIÓN DE PANTALLAS (FORMULARIO <-> DESGLOSE COMPLETO)
document.addEventListener('click', (e) => {
    const btnShowDetails = e.target.closest('#btnShowDetails');
    const btnBackToForm = e.target.closest('#btnBackToForm');

    if (btnShowDetails) {
        e.preventDefault();
        document.getElementById('form-root')?.classList.add('hidden');
        document.getElementById('results-root')?.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (btnBackToForm) {
        e.preventDefault();
        document.getElementById('results-root')?.classList.add('hidden');
        document.getElementById('form-root')?.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Inicialización de la App al cargar el DOM
document.addEventListener('DOMContentLoaded', initApp);