# CicloTrace
Solução de rastreabilidade e auditoria operacional para a cadeia de reciclagem, desenvolvida no Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS) do Centro Universitário Brasileiro (UNIBRA), alinhada às metas do ODS 12 (Consumo e Produção Responsáveis).

## Governança de Dados e Status Institucional

- **Base de Dados 100% Fictícia:** Todos os registros de lotes, pesagens, movimentações e indicadores exibidos no protótipo e nos painéis analíticos operam sobre uma **massa de dados simulada de 3.000 kg**, estruturada exclusivamente para validação funcional e de arquitetura.
- **Tramitação Institucional junto à EMLURB:** Projeto de caráter estritamente acadêmico. A documentação formal (Ofício Institucional UNIBRA) solicitando autorização para estudo piloto e validação conceitual foi encaminhada à **EMLURB** (Autarquia de Manutenção e Limpeza Urbana do Recife) em **17/11/2026**. O grupo aguarda o parecer oficial da autarquia antes de qualquer uso de parâmetros operacionais reais, mantendo o documento fora do repositório público por conformidade e segurança da informação.

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

### Stack Tecnológica
- **Protótipo Front-end (`index.html`):** HTML5 e Tailwind CSS, executado diretamente no navegador sem dependências de build.
- **Persistência (Grafo):** Neo4j orquestrado via Docker (`docker-compose.yml`).
- **Analytics:** Power BI.

## Estrutura do Repositório

```text
CicloTrace/
├── index.html             # Protótipo interativo da aplicação web
├── docker-compose.yml     # Definição do container Neo4j para ambiente local
├── .gitignore             # Regras de arquivos ignorados no versionamento Git
└── README.md              # Documentação técnica e funcional do projeto
```

- **index.html:** Arquivo principal da interface navegável, padronizado na raiz do repositório para permitir execução direta em navegador e publicação via GitHub Pages.
- **docker-compose.yml:** Configuração de ambiente para subir o banco de dados Neo4j localmente e executar consultas Cypher.

## Como Executar

### 1. Protótipo Interativo
Por ser uma aplicação estática executada direto no navegador, não exige servidor local. Clone o repositório e abra o arquivo `index.html`:

```bash
git clone [https://github.com/hellencatarine9-git/CicloTrace.git](https://github.com/hellencatarine9-git/CicloTrace.git)
```

Com o GitHub Pages habilitado em `Settings > Pages` (branch `main`), o protótipo também pode ser validado diretamente pela URL pública do repositório.

### 2. Ambiente Neo4j (Opcional)
Com o Docker instalado, execute na raiz do projeto:

```bash
docker-compose up -d
```

O Neo4j Browser ficará acessível em `http://localhost:7474` (protocolo Bolt na porta `7687`).

## Liderança, Orientação e Equipe

- **Instituição:** Centro Universitário Brasileiro (UNIBRA) - Recife/PE
- **Curso:** Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)
- **Orientação Acadêmica:** Prof. André Ribeiro - MSc em Ciência da Computação (CIn/UFPE) | Professor Universitário | Pesquisador | Tutor PBL | Analista de Sistemas
- **Liderança de Projeto e Análise Funcional:** Hellen Gomes - Analista Funcional (Minsait / Secretaria de Educação e Tecnologia do Recife) | Graduanda em ADS (UNIBRA) e equipe CicloTrace
