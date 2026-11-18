
import pandas as pd
import json
import os

# =====================================
# CONFIGURAÇÕES
# =====================================

# Diretório onde está o próprio preparar_json.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Diretórios de entrada e saída
PASTA_ENTRADA = os.path.join(BASE_DIR, "data", "processed")
PASTA_SAIDA = os.path.join(BASE_DIR, "data", "ocorrencias")

os.makedirs(PASTA_SAIDA, exist_ok=True)

# =====================================
# FUNÇÃO PARA EXPORTAR JSON
# =====================================

def exportar_json(nome, dados):

    caminho = os.path.join(PASTA_SAIDA, nome)

    with open(caminho, "w", encoding="utf-8") as arquivo:
        json.dump(
            dados,
            arquivo,
            ensure_ascii=False,
            indent=2
        )

    print(f"Arquivo gerado: {caminho}")


# =====================================
# 1. OCORRÊNCIAS
# =====================================

df = pd.read_csv(
    os.path.join(PASTA_ENTRADA, "ocorrencias.csv"),
    dtype=str
).fillna("")

# Converter coordenadas
def converter_float(valor):
    try:
        return float(str(valor).replace(",", "."))
    except:
        return None

ocorrencias = []

for _, linha in df.iterrows():

    data = linha["Data_da_Ocorrencia"]

    ano = int(data[:4]) if len(data) >= 4 and data[:4].isdigit() else None

    ocorrencias.append({
        "id": linha["Numero_da_Ocorrencia"],
        "date": data,
        "year": ano,
        "classification": linha["Classificacao_da_Ocorrencia"],
        "municipality": linha["Municipio"],
        "state": linha["UF"],
        "region": linha["Regiao"],
        "latitude": converter_float(linha["Latitude"]),
        "longitude": converter_float(linha["Longitude"]),
        "history": linha["Historico"]
    })

exportar_json("ocorrencias.json", ocorrencias)


# =====================================
# 2. TIPOS DE OCORRÊNCIA
# =====================================

df_tipos = pd.read_csv(
    os.path.join(PASTA_ENTRADA, "ocorrencia_tipos.csv"),
    dtype=str
).fillna("")

tipos = []

for _, linha in df_tipos.iterrows():

    tipos.append({
        "id": linha["Numero_da_Ocorrencia"],
        "description": linha["Descricao_do_Tipo"],
        "type": linha["Tipo_de_Ocorrencia"],
        "phase": linha["Fase_da_Operacao"]
    })

exportar_json("tipos.json", tipos)


# =====================================
# 3. AERONAVES
# =====================================

df_aeronaves = pd.read_csv(
    os.path.join(PASTA_ENTRADA, "ocorrencia_aeronaves.csv"),
    dtype=str
).fillna("")

aeronaves = []

for _, linha in df_aeronaves.iterrows():

    aeronaves.append({
        "id": linha["Numero_da_Ocorrencia"],
        "registration": linha["Matricula"],
        "registration_key": linha["Matricula_chave"],
        "manufacturer": linha["Nome_do_Fabricante"],
        "model": linha["Modelo"]
    })

exportar_json("aeronaves.json", aeronaves)


print("\nProcessamento concluído!")
