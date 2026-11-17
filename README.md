# CicloTrace
Solução autoral de rastreabilidade e auditoria operacional para a cadeia de reciclagem, alinhada às diretrizes do ODS 12 (Consumo e Produção Responsáveis).

## Governança de Dados e Status Institucional

- **Base de Dados 100% Fictícia:** Todos os registros de lotes, pesagens, movimentações e indicadores exibidos no protótipo e nos painéis analíticos operam sobre uma **massa de dados simulada de 3.000 kg**, estruturada exclusivamente para validação funcional e de arquitetura.
- **Tramitação junto à EMLURB:** O projeto aguarda parecer e liberação formal da **EMLURB** (Autarquia de Manutenção e Limpeza Urbana do Recife) para eventual estudo piloto ou validação com parâmetros operacionais reais da coleta seletiva. A documentação formal solicitando autorização foi encaminhada em **17/11/2026**, sendo mantida fora do repositório público por conformidade e segurança da informação.

## Problema de Negócio e Escopo Funcional

Na operação de coleta seletiva e triagem, a falta de registro padronizado entre a coleta na origem, o beneficiamento nas cooperativas e a venda para a indústria gera perda de rastreabilidade, divergências de pesagem e dificuldade na apuração de rejeitos. O CicloTrace estrutura esse processo em quatro frentes:

1. **Registro de Coleta:** Geração de identificador único por lote na origem, vinculando tipologia do resíduo, data/hora e peso bruto inicial.
2. **Triagem e Regra de Balanço de Massa:** Registro de processamento nas cooperativas com conciliação obrigatória entre peso bruto recebido, volume aproveitado e rejeito, isolando perdas por contaminação ou descarte.
3. **Rastreabilidade de Ponta a Ponta:** Consulta do histórico completo de movimentações, pesagens e transformações sofridas por cada lote entre os agentes da cadeia.
4. **Camada Analítica:** Consolidação de indicadores no Power BI para acompanhamento da eficiência de triagem e taxas de perda por etapa.

## Arquitetura e Decisões Técnicas

### Escolha do Banco Orientado a Grafos (Neo4j)
Em um banco relacional tradicional (SQL), rastrear lotes que sofrem fracionamento, agrupamento e múltiplas etapas de triagem exigiria junções recursivas complexas (self-joins) e alto custo de consulta. A modelagem em grafo representa nativamente os agentes e as transições de estado do material, permitindo percorrer toda a linhagem de um lote desde a indústria recicladora até a origem da coleta de forma direta.

### Modelo de Dados e Regras de Estado
- **Nós (Entidades):**
  - `Organizacao`: Atores da cadeia (gestão pública, cooperativas de triagem e indústrias recicladoras).
  - `LoteMaterial`: Unidade rastreável com `id_lote`, `tipologia`, `massa_kg` e controle de estado (`Coletado`, `Triado`, `Aproveitado`, `Rejeito`).
  - `Transformacao`: Eventos operacionais de coleta, triagem, prensagem e destinação final.
- **Relacionamentos:** `TRANSPORTE`, `GERACAO` e `PROCESSAMENTO`.
- **Resultados da Base Piloto Simulada (3.000 kg):** Taxa de aproveitamento efetivo de 78,3% e taxa de perdas/rejeito de 21,7%.

### Stack Tecnológica e Organização Front-end
- **Front-end (`index.html`, `css/style.css`, `js/app.js`):** Estruturado com separação de responsabilidades entre marcação HTML5, estilização (Tailwind CSS e estilos customizados) e lógica client-side em JavaScript puro, sem dependências de build.
- **Persistência (Grafo):** Neo4j orquestrado via Docker (`docker-compose.yml`).
- **Analytics:** Power BI.

## Estrutura do Repositório

```text
CicloTrace/
├── index.html             # Estrutura principal da interface web
├── css/
│   └── style.css          # Folha de estilos customizados da aplicação
├── js/
│   └── app.js             # Lógica de negócio client-side e interatividade
├── docker-compose.yml     # Definição do container Neo4j para ambiente local
├── .gitignore             # Regras de arquivos ignorados no versionamento Git
└── README.md              # Documentação técnica e funcional do projeto
```

## Como Executar

### 1. Protótipo Interativo
Por ser uma aplicação estática executada direto no navegador, não exige servidor local. Clone o repositório e abra o arquivo `index.html`:

```bash
git clone [https://github.com/hellencatarine9-git/CicloTrace.git](https://github.com/hellencatarine9-git/CicloTrace.git)
```

Com o GitHub Pages habilitado em `Settings > Pages` (branch `main`), o protótipo também pode ser validado diretamente pela URL pública gerada pelo repositório.

### 2. Ambiente Neo4j (Opcional)
Com o Docker instalado, execute na raiz do projeto:

```bash
docker-compose up -d
```

O Neo4j Browser ficará acessível em `http://localhost:7474` (protocolo Bolt na porta `7687`).

## Autoria

- **Idealização, Análise Funcional e Desenvolvimento:** Hellen Gomes - Analista Funcional | Graduanda em Análise e Desenvolvimento de Sistemas (ADS)
