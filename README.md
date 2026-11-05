# CineSeat

Sistema distribuído de reserva e venda de ingressos de cinema, com garantia de que cada assento é vendido uma única vez.

Projeto Final de **Engenharia de Sistemas Distribuídos 2026.2** (UFPB).

> **Status:** Projeto 02 (documentação inicial). A arquitetura, as decisões e o ambiente estão prontos; os serviços ainda são esqueletos, e a lógica de negócio será implementada no Projeto 03.

## Equipe

- Antonio Augusto Dantas Neto
- Deivily Breno Silva Carneiro
- Everton Emanuel Llarena da Silva
- Kaique Bezerra Santos
- Lucas Gabriel Fontes da Silva

## Problema

Em estreias de grandes filmes, muitos clientes disputam as mesmas poltronas ao mesmo tempo. Sem coordenação, o sistema pode vender o mesmo assento duas vezes, e uma falha no pagamento pode deixar poltronas presas sem comprador. O CineSeat garante que cada assento seja vendido uma única vez e que reservas abandonadas ou com pagamento falho sejam desfeitas automaticamente.

## Solução proposta

Fluxo principal: o cliente escolhe a sessão, vê o mapa de assentos, reserva com tempo limite de 5 minutos, paga (pagamento simulado, com falhas injetadas) e recebe a confirmação.

Serviços previstos:

| Serviço | Responsabilidade |
|---|---|
| Gateway / Autenticação | Entrada única da API, autenticação JWT e rate limiting |
| Catálogo de Sessões | Filmes, sessões, layout e composição do mapa de assentos (carga inicial por seed, sem tela de administração) |
| Reservas | Dono do estado dos assentos; orquestra a SAGA de reserva, pagamento e confirmação |
| Pagamento | Pagamento simulado, com falhas injetadas para testar a compensação |
| Notificações | Envio das confirmações, com retry e DLQ |

## Padrões arquiteturais

- **API Gateway** com autenticação JWT e rate limiting
- **SAGA orquestrada** (com compensação: liberar o assento se o pagamento falhar)
- **Transactional Outbox** para publicar eventos sem perda
- **Retry Pattern + DLQ** nas notificações e no processamento de eventos
- **Circuit Breaker** na chamada ao serviço de pagamento
- **Cache-Aside** (Redis) para o catálogo e o mapa de assentos

Áreas técnicas cobertas: confiabilidade, desempenho e segurança. Detalhes e mudanças desde a proposta em [docs/patterns.md](docs/patterns.md).

## Tecnologias previstas

TypeScript/Node.js com Fastify, PostgreSQL (um banco lógico por serviço), Redis (cache e rate limiting), RabbitMQ, Docker Compose, GitHub Actions (CI com Semgrep e Trivy), k6 (testes de carga), Prometheus e Grafana. Justificativas em [docs/stack.md](docs/stack.md).

## Critérios de sucesso

1. **0 assentos vendidos em duplicidade** em teste com 1.000 tentativas concorrentes de reservar o mesmo assento.
2. **p95 abaixo de 300 ms** na consulta do mapa de assentos com 200 usuários virtuais simultâneos.
3. **100% das reservas compensadas** (assento liberado) quando o pagamento falha, com 30% de falhas injetadas.
4. **Liberação automática** de assentos não pagos em até 5 segundos após o fim do tempo limite.
5. **Resiliência:** com o serviço de pagamento fora do ar, o Circuit Breaker abre e a API responde em menos de 1 s, sem travar os demais serviços.
6. **Idempotência:** reenviar a mesma requisição de reserva não cria reservas ou cobranças duplicadas.

Cenários e evidências de cada critério em [docs/test-plan.md](docs/test-plan.md).

## Como executar

Requer Docker com Docker Compose.

```bash
docker compose up --build --detach --wait
./scripts/smoke.sh
```

| Endereço | Serviço |
|---|---|
| http://localhost:3000/health | Gateway |
| http://localhost:3030 | Grafana (usuário `admin`, senha padrão `cineseat`) |
| http://localhost:9090 | Prometheus |
| http://localhost:15672 | RabbitMQ (usuário e senha padrão `cineseat`) |

As senhas padrão servem apenas para desenvolvimento local. Para trocá-las, copie `.env.example` para `.env`.

Para desenvolver sem Docker (requer Node.js 22):

```bash
npm ci
npm run lint
npm test
```

## Documentação

- [Diagramas C4 (níveis 1 e 2)](docs/architecture/c4.md)
- [ADRs](docs/adr/): [001 fonte da verdade do assento](docs/adr/ADR-001-seat-source-of-truth.md), [002 SAGA orquestrada](docs/adr/ADR-002-orchestrated-saga.md), [003 pagamento síncrono e eventos assíncronos](docs/adr/ADR-003-sync-payment-async-events.md), [004 Outbox por polling](docs/adr/ADR-004-outbox-polling.md)
- [Stack e justificativas](docs/stack.md)
- [Padrões arquiteturais](docs/patterns.md)
- [Plano de testes](docs/test-plan.md)
- [Divisão de responsabilidades](docs/team.md)
- [Roteiro da apresentação](docs/presentation.md)

## Ferramentas de IA utilizadas

> **Rascunho: a equipe deve revisar e completar esta seção antes da entrega.** A omissão desta seção desclassifica a entrega.

**Ferramentas:** Claude Code (modelo Claude Opus 5.5). *[A equipe deve acrescentar qualquer outra ferramenta usada, inclusive no Projeto 01.]*

**Onde foi usada:**

- **Análise:** revisão da proposta do Projeto 01 em relação à especificação.
- **Documentação:** rascunho dos diagramas C4, ADRs, stack, padrões, plano de testes, divisão de responsabilidades e roteiro.
- **Código:** esqueleto do monorepo, serviços, Dockerfile, Docker Compose e pipeline de CI.

**Como foi orientada:** a IA recebeu a especificação do professor, a proposta da equipe e o repositório. A equipe pediu uma revisão crítica, aprovou um plano e definiu as regras de divisão e de commits.

**Fluxo de trabalho:** a equipe trabalhou em uma única máquina e em uma única sessão do Claude Code. O autor de cada commit é o integrante responsável pela tarefa e que revisou o conteúdo, mas o conteúdo inicial foi gerado com a IA, conforme descrito acima. Por decisão da equipe, os commits não têm a IA como coautora, e esta seção é o registro dessa participação.

**Avaliação honesta:** *[A equipe deve preencher com o que funcionou, o que precisou ser corrigido e o que foi descartado.]* Pontos já conhecidos:

- **Funcionou:** a revisão apontou lacunas na proposta, como o uso do Redis como garantia e os casos de timeout no pagamento.
- **Limitação:** a máquina usada não tinha Docker, então a IA não executou o ambiente Compose localmente; essa validação fica a cargo do CI.

## Cronograma

| Entrega | Data | Situação |
|---|---|---|
| Projeto 01: grupo e tema | 09/10/2026 | Entregue |
| Projeto 02: documentação inicial | 06/11/2026 | Em andamento |
| Projeto 03: documentação final | 11/12/2026 | Pendente |

