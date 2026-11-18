
const DATA_PATH = "../data/ocorrencias/";

let ocorrencias = [];
let tipos = [];
let aeronaves = [];
let graficos = {};

const formatarNumero = new Intl.NumberFormat("pt-BR");
const comparador = new Intl.Collator("pt-BR");

async function carregarDados() {
    try {
        const [resOcorrencias, resTipos, resAeronaves] =
            await Promise.all([
                fetch(DATA_PATH + "ocorrencias.json"),
                fetch(DATA_PATH + "tipos.json"),
                fetch(DATA_PATH + "aeronaves.json")
            ]);

        if (!resOcorrencias.ok || !resTipos.ok || !resAeronaves.ok) {
            throw new Error("Não foi possível localizar um ou mais arquivos JSON.");
        }

        ocorrencias = await resOcorrencias.json();
        tipos = await resTipos.json();
        aeronaves = await resAeronaves.json();

        configurarFiltros();
        atualizarDashboard();

        console.log("Dados carregados com sucesso:", {
            ocorrencias: ocorrencias.length,
            tipos: tipos.length,
            aeronaves: aeronaves.length
        });

    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);
        alert("Não foi possível carregar os dados do dashboard. Confira o console.");
    }
}

// Preenche os filtros com os valores disponíveis na base
function configurarFiltros() {
    preencherFiltro(
        "filter-year",
        [...new Set(ocorrencias.map(item => item.year).filter(Boolean))]
            .sort((a, b) => Number(a) - Number(b)),
        "Todos os anos"
    );

    preencherFiltro(
        "filter-classification",
        valoresUnicos("classification"),
        "Todas as classificações"
    );

    preencherFiltro(
        "filter-region",
        valoresUnicos("region"),
        "Todas as regiões"
    );

    preencherFiltro(
        "filter-state",
        valoresUnicos("state"),
        "Todos os estados"
    );

    document.getElementById("filter-year")
        .addEventListener("change", atualizarDashboard);

    document.getElementById("filter-classification")
        .addEventListener("change", atualizarDashboard);

    document.getElementById("filter-region")
        .addEventListener("change", atualizarDashboard);

    document.getElementById("filter-state")
        .addEventListener("change", atualizarDashboard);

    document.getElementById("clear-filters")
        .addEventListener("click", limparFiltros);
}

// Retorna valores únicos de uma coluna
function valoresUnicos(campo) {
    return [...new Set(
        ocorrencias
            .map(item => String(item[campo] || "").trim())
            .filter(valor => valor !== "")
    )].sort(comparador.compare);
}

// Cria as opções dos filtros
function preencherFiltro(id, valores, textoInicial) {
    const elemento = document.getElementById(id);

    elemento.innerHTML = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = textoInicial;
    elemento.appendChild(opcaoInicial);

    valores.forEach(valor => {
        const opcao = document.createElement("option");
        opcao.value = valor;
        opcao.textContent = valor;
        elemento.appendChild(opcao);
    });
}

// Aplica os filtros selecionados
function obterOcorrenciasFiltradas() {
    const ano = document.getElementById("filter-year").value;
    const classificacao = document.getElementById("filter-classification").value;
    const regiao = document.getElementById("filter-region").value;
    const estado = document.getElementById("filter-state").value;

    return ocorrencias.filter(item => {
        return (
            (!ano || String(item.year) === ano) &&
            (!classificacao || item.classification === classificacao) &&
            (!regiao || item.region === regiao) &&
            (!estado || item.state === estado)
        );
    });
}

// Atualiza os indicadores
function atualizarDashboard() {
    const dadosFiltrados = obterOcorrenciasFiltradas();

    const total = dadosFiltrados.length;

    const acidentes = dadosFiltrados.filter(
        item => item.classification === "Acidente"
    ).length;

    const incidentes = dadosFiltrados.filter(
        item => item.classification === "Incidente Grave"
    ).length;

    document.getElementById("kpi-total").textContent =
        formatarNumero.format(total);

    document.getElementById("kpi-accidents").textContent =
        formatarNumero.format(acidentes);

    document.getElementById("kpi-incidents").textContent =
        formatarNumero.format(incidentes);

        // A informação de vítimas será integrada na próxima etapa.
    const indicadorVitimas = document.getElementById("kpi-fatalities");


    if (indicadorVitimas) {
        indicadorVitimas.textContent = "—";
    }

    atualizarGraficos(dadosFiltrados);
    
    console.log("Dashboard atualizado:", {
        total,
        acidentes,
        incidentes
    });
}

// Limpa todos os filtros
function limparFiltros() {
    document.getElementById("filter-year").value = "";
    document.getElementById("filter-classification").value = "";
    document.getElementById("filter-region").value = "";
    document.getElementById("filter-state").value = "";

    atualizarDashboard();
}


// ==========================================
// CONFIGURAÇÃO E ATUALIZAÇÃO DOS GRÁFICOS
// ==========================================

const MESES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const CORES = {
    azul: "#2563eb",
    azulClaro: "#60a5fa",
    laranja: "#f59e0b",
    verde: "#10b981",
    roxo: "#8b5cf6"
};

// Agrupa os registros por uma determinada propriedade
function agruparPor(dados, campo) {
    const resultado = {};

    dados.forEach(item => {
        const valor = String(item[campo] || "").trim();

        if (!valor) return;

        resultado[valor] = (resultado[valor] || 0) + 1;
    });

    return resultado;
}

// Cria ou atualiza um gráfico
function criarOuAtualizarGrafico(id, configuracao) {
    const canvas = document.getElementById(id);

    if (!canvas) {
        console.warn(`Canvas não encontrado: ${id}`);
        return;
    }

    if (graficos[id]) {
        graficos[id].data = configuracao.data;
        graficos[id].options = configuracao.options;
        graficos[id].update();
    } else {
        graficos[id] = new Chart(canvas, configuracao);
    }
}

// Atualiza todos os gráficos
function atualizarGraficos(dados) {
    if (typeof Chart === "undefined") {
        console.error("Chart.js não foi carregado.");
        return;
    }

    graficoAnual(dados);
    graficoMensal(dados);
    graficoRegiao(dados);
    graficoEstado(dados);
}

// ==========================================
// 1. EVOLUÇÃO ANUAL
// ==========================================

function graficoAnual(dados) {
    const anos = [...new Set(
        dados.map(item => String(item.year))
            .filter(ano => ano !== "null" && ano !== "undefined")
    )].sort((a, b) => Number(a) - Number(b));

    const acidentes = anos.map(ano =>
        dados.filter(item =>
            String(item.year) === ano &&
            item.classification === "Acidente"
        ).length
    );

    const incidentes = anos.map(ano =>
        dados.filter(item =>
            String(item.year) === ano &&
            item.classification === "Incidente Grave"
        ).length
    );

    criarOuAtualizarGrafico("chart-year", {
        type: "bar",
        data: {
            labels: anos,
            datasets: [
                {
                    label: "Acidentes",
                    data: acidentes,
                    backgroundColor: CORES.azul,
                    borderRadius: 5
                },
                {
                    label: "Incidentes graves",
                    data: incidentes,
                    backgroundColor: CORES.laranja,
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    position: "bottom"
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// ==========================================
// 2. DISTRIBUIÇÃO MENSAL
// ==========================================

function graficoMensal(dados) {
    const contagem = Array(12).fill(0);

    dados.forEach(item => {
        const partes = String(item.date || "").split("-");

        // Espera data no formato AAAA-MM-DD
        const mes = Number(partes[1]);

        if (mes >= 1 && mes <= 12) {
            contagem[mes - 1]++;
        }
    });

    criarOuAtualizarGrafico("chart-month", {
        type: "line",
        data: {
            labels: MESES,
            datasets: [
                {
                    label: "Ocorrências",
                    data: contagem,
                    borderColor: CORES.azul,
                    backgroundColor: "rgba(37, 99, 235, 0.12)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// ==========================================
// 3. DISTRIBUIÇÃO POR REGIÃO
// ==========================================

function graficoRegiao(dados) {
    const contagem = agruparPor(dados, "region");

    const regioes = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1]);

    criarOuAtualizarGrafico("chart-region", {
        type: "doughnut",
        data: {
            labels: regioes.map(item => item[0]),
            datasets: [
                {
                    data: regioes.map(item => item[1]),
                    backgroundColor: [
                        CORES.azul,
                        CORES.laranja,
                        CORES.verde,
                        CORES.roxo,
                        CORES.azulClaro
                    ],
                    borderWidth: 2,
                    borderColor: "#ffffff"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// ==========================================
// 4. DISTRIBUIÇÃO POR ESTADO
// ==========================================

function graficoEstado(dados) {
    const contagem = agruparPor(dados, "state");

    const estados = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    criarOuAtualizarGrafico("chart-state", {
        type: "bar",
        data: {
            labels: estados.map(item => item[0]),
            datasets: [
                {
                    label: "Ocorrências",
                    data: estados.map(item => item[1]),
                    backgroundColor: CORES.azul,
                    borderRadius: 5
                }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


document.addEventListener("DOMContentLoaded", carregarDados);


