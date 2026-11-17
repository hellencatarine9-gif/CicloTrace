# CicloTrace
Solução de rastreabilidade e auditoria de resíduos recicláveis desenvolvida no curso de Análise e Desenvolvimento de Sistemas (ADS) do Centro Universitário Brasileiro (UNIBRA), alinhada às diretrizes do ODS 12 (Consumo e Produção Responsáveis).

> **Governança de Dados:** Os registros, pesagens e indicadores presentes no protótipo e nos painéis analíticos operam sobre uma **base piloto simulada (3.000 kg)** para validação funcional e de arquitetura, tomando como referência o fluxo operacional da coleta seletiva urbana do Recife/PE.

---

## Problema de Negócio e Escopo Funcional

Na cadeia de reciclagem, a ausência de padronização entre o registro da coleta, a triagem nas cooperativas e a destinação industrial gera perda de rastreabilidade, divergências de pesagem e dificuldade na apuração de rejeitos. O CicloTrace modela o controle operacional em quatro etapas:

1. **Registro de Coleta:** Geração de identificador único por lote na origem, vinculando tipologia do material, data/hora e peso bruto inicial.
2. **Triagem e Balanço de Massa:** Registro de entrada e processamento nas cooperativas, aplicando a regra de negócio de balanço de massa (`Peso Bruto = Volume Aproveitado + Rejeito`) para isolar perdas por contaminação ou descarte.
3. **Cadeia de Custódia (Data Lineage):** Consulta do histórico de movimentações e transformações sofridas por cada lote ao longo dos agentes da cadeia.
4. **Camada Analítica (BI):** Consolidação de indicadores operacionais para acompanhamento de eficiência de triagem e perdas por processo.

---

## Arquitetura e Decisões Técnicas

### Por que Banco de Dados Orientado a Grafos (Neo4j)?
Diferente de um modelo relacional tradicional (SQL), onde o rastreamento de lotes que sofrem fracionamento, agrupamento e múltiplas etapas de beneficiamento exigiria junções recursivas complexas (`SELF JOIN`), a modelagem em **grafo** representa nativamente as entidades e suas transições de estado. Isso permite percorrer toda a linhagem de um lote desde a indústria recicladora até a origem da coleta com baixa latência de consulta.

### Modelo de Dados (Schema)
- **Nós (Entidades):**
  - `:Organizacao` — Agentes da cadeia (gestão pública, cooperativas de triagem e indústrias recicladoras).
  - `:LoteMaterial` — Unidade rastreável contendo `id_lote`, `tipologia`, `massa_kg` e `status` (Coletado, Triado, Aproveitado, Rejeito).
  - `:Transformacao` — Eventos operacionais de coleta, triagem, prensagem e destinação final.
- **Relacionamentos (Arestas):** `TRANSPORTE`, `GERACAO` e `PROCESSAMENTO`.
- **Métricas da Base Piloto (3.000 kg):** Taxa de aproveitamento efetivo de **78,3%** e taxa de perdas/rejeito de **21,7%**.

### Stack Tecnológica
- **Protótipo Front-end (`index.html`):** HTML5 e Tailwind CSS (execução client-side sem dependências de build).
- **Persistência (Grafo):** Neo4j orquestrado via Docker (`docker-compose.yml`).
- **Analytics:** Power BI.

---

## Estrutura do Repositório

```text
CicloTrace/
├── index.html             # Protótipo interativo da aplicação web
├── docker-compose.yml     # Definição do container Neo4j para ambiente local
├── .gitignore             # Regras de arquivos ignorados no versionamento Git
└── README.md              # Documentação técnica e funcional do projeto
```

- **`index.html`:** Arquivo principal da interface navegável, padronizado como `index.html` na raiz do repositório para permitir execução direta em navegador e publicação estática via **GitHub Pages**.
- **`docker-compose.yml`:** Configuração de infraestrutura como código para reprodutibilidade do ambiente local do banco de dados Neo4j e execução de queries Cypher.

---

## Como Executar

### 1. Protótipo Interativo (`index.html`)
Por ser uma aplicação estática client-side, não exige instalação de servidor local. Basta clonar o repositório e abrir o arquivo `index.html` no navegador:

```bash
git clone [https://github.com/hellencatarine9-git/CicloTrace.git](https://github.com/hellencatarine9-git/CicloTrace.git)
```

Com o **GitHub Pages** habilitado em `Settings > Pages` (branch `main`), o protótipo também pode ser validado diretamente pela URL pública gerada pelo repositório.

### 2. Ambiente Neo4j (Opcional)
Com o Docker e o Docker Compose instalados, execute na raiz do projeto:

```bash
docker-compose up -d
```

O Neo4j Browser ficará acessível em `http://localhost:7474` (protocolo Bolt na porta `7687`).

---

## Autoria e Orientação Acadêmica

- **Instituição:** Centro Universitário Brasileiro (UNIBRA) - Recife/PE
- **Curso:** Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)
- **Orientação:** Prof. André Ribeiro — MSc em Ciência da Computação (CIn/UFPE) | Professor Universitário | Pesquisador | Tutor PBL | Analista de Sistemas
- **Análise Funcional e Desenvolvimento:** Hellen Gomes — Analista Funcional (Minsait / Secretaria de Educação e Tecnologia do Recife) | Graduanda em ADS (UNIBRA) e equipe
