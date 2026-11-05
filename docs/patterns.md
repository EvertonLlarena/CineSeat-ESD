# Padrões arquiteturais

A especificação exige pelo menos 3 padrões e 2 áreas técnicas. O CineSeat aplica 6 padrões principais e cobre **confiabilidade, desempenho e segurança**.

| Padrão | Área | Onde é aplicado | Por quê | Como será validado |
|---|---|---|---|---|
| API Gateway (JWT e rate limiting) | Segurança | Serviço Gateway | Entrada única, autenticação centralizada e proteção contra abuso | P3 |
| SAGA orquestrada | Confiabilidade | Serviço Reservas | Coordena reserva, cobrança e confirmação entre bancos separados ([ADR-002](adr/ADR-002-orchestrated-saga.md)) | Critérios 3 e 4 |
| Transactional Outbox | Confiabilidade | Reservas para RabbitMQ | Evita perder eventos entre o banco e o broker ([ADR-004](adr/ADR-004-outbox-polling.md)) | P1 |
| Retry e DLQ | Confiabilidade | Notificações e consumidores de eventos | Absorve falhas temporárias e isola as permanentes | P2 |
| Circuit Breaker | Confiabilidade | Chamada de Reservas para Pagamento | Evita travar a API quando Pagamento falha ([ADR-003](adr/ADR-003-sync-payment-async-events.md)) | Critério 5 |
| Cache-Aside | Desempenho | Catálogo, no mapa de assentos | Absorve o pico de leitura em estreias | Critério 2 |

**Padrões de apoio:** Database per Service, API Composition (mapa de assentos), Idempotency Key e consumidor idempotente.

**Segurança no pipeline:** SAST (Semgrep), SCA, segredos e configuração (Trivy).

## Mudanças desde a proposta do Projeto 01

| Tema | Proposta | Agora | Motivo |
|---|---|---|---|
| Bloqueio do assento | Redis com TTL | Atualização condicional no PostgreSQL | O Redis pode perder o bloqueio em failover ([ADR-001](adr/ADR-001-seat-source-of-truth.md)) |
| Estado do assento | Sem dono definido | Serviço Reservas | Evita o mesmo estado em dois serviços |
| Compensação | Liberar o assento | Anular ou estornar a cobrança e depois liberar | Timeout não significa que a cobrança falhou |
| Frontend | Não mencionado | Página simples, com polling | A demonstração precisa mostrar o mapa |
| Testes | Sem teste para Outbox, DLQ e gateway | Um teste para cada padrão | A especificação pede validação das decisões |

## Escopo

- **Compra:** até 4 assentos por reserva, tudo ou nada, com travamento em ordem fixa para evitar deadlock.
- **Fora do escopo:** tela de administração, Kubernetes, Service Mesh, Kafka, Event Sourcing e WebSocket.
