# CineSeat

Sistema distribuído de reserva e venda de ingressos de cinema, com garantia de que cada assento é vendido uma única vez.

Projeto Final de **Engenharia de Sistemas Distribuídos 2026.2** (UFPB).

> **Status:** Projeto 01 (definição do grupo e tema). A documentação completa, o código e as instruções de execução serão adicionados nas próximas entregas.

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
| Catálogo de Sessões | Filmes, sessões e mapa de assentos (carga inicial por seed, sem tela de administração) |
| Reservas | Orquestra a SAGA de reserva, pagamento e confirmação |
| Pagamento | Pagamento simulado, com falhas injetadas para testar a compensação |
| Notificações | Envio das confirmações, com retry e DLQ |

## Padrões arquiteturais

- **API Gateway** com autenticação JWT e rate limiting
- **SAGA orquestrada** (com compensação: liberar o assento se o pagamento falhar)
- **Transactional Outbox** para publicar eventos sem perda
- **Retry Pattern + DLQ** nas notificações e no processamento de eventos
- **Circuit Breaker** na chamada ao serviço de pagamento
- **Cache-Aside** (Redis) para o catálogo e o mapa de assentos

Áreas técnicas cobertas: confiabilidade, desempenho e segurança.

## Tecnologias previstas

*A confirmar na entrega do Projeto 02.*

TypeScript/Node.js, PostgreSQL (um banco por serviço), Redis (cache e bloqueio temporário de assentos com TTL), RabbitMQ, Docker Compose, GitHub Actions (CI com Semgrep e Trivy), k6 (testes de carga), Prometheus e Grafana.

## Critérios de sucesso

1. **0 assentos vendidos em duplicidade** em teste com 1.000 tentativas concorrentes de reservar o mesmo assento.
2. **p95 abaixo de 300 ms** na consulta do mapa de assentos com 200 usuários virtuais simultâneos.
3. **100% das reservas compensadas** (assento liberado) quando o pagamento falha, com 30% de falhas injetadas.
4. **Liberação automática** de assentos não pagos em até 5 segundos após o fim do tempo limite.
5. **Resiliência:** com o serviço de pagamento fora do ar, o Circuit Breaker abre e a API responde em menos de 1 s, sem travar os demais serviços.
6. **Idempotência:** reenviar a mesma requisição de reserva não cria reservas ou cobranças duplicadas.

## Como executar

*A preencher quando o ambiente com Docker Compose estiver pronto (Projeto 02).*

## Documentação

*Será adicionada nas próximas entregas.*

- [ ] Diagrama de arquitetura C4 (níveis 1 e 2)
- [ ] ADRs (Architecture Decision Records)
- [ ] Trade-offs documentados
- [ ] Plano e resultados de testes (carga, resiliência e integração)

## Cronograma

| Entrega | Data | Situação |
|---|---|---|
| Projeto 01: grupo e tema | 09/10/2026 | Em andamento |
| Projeto 02: documentação inicial | 06/11/2026 | Pendente |
| Projeto 03: documentação final | 11/12/2026 | Pendente |

## Ferramentas de IA utilizadas

> Seção obrigatória. 
