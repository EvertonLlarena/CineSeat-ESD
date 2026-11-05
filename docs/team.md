# Divisão de responsabilidades

Cada frente tem um responsável, que responde pelas decisões daquela parte e a defende na apresentação. O trabalho pode ter apoio dos demais.

| Integrante | GitHub | Frente | Projeto 02 | Projeto 03 |
|---|---|---|---|---|
| Everton Emanuel Llarena da Silva | `EvertonLlarena` | Reservas e SAGA | ADR-001, ADR-002, esta divisão | Estado dos assentos, SAGA, Outbox, varredura de prazos, experimento E1 |
| Deivily Breno Silva Carneiro | `dbreno` | Gateway, autenticação e segurança no CI | Pipeline de CI, README | JWT, rate limiting, roteamento, teste P3, assinatura de imagens e SBOM |
| Lucas Gabriel Fontes da Silva | `LucasGabrielFontes` | Pagamento e resiliência | ADR-003, documento de padrões | Cobrança simulada, injeção de falhas, Circuit Breaker, critério 5 |
| Kaique Bezerra Santos | `KaiqueSantos2004` | Catálogo, cache e frontend | C4, stack, roteiro da apresentação | Seed, composição do mapa, Cache-Aside, página web, experimento E2 |
| Antonio Augusto Dantas Neto | `AntonioaDn` | Notificações, observabilidade e carga | Base do monorepo, Compose, ADR-004, plano de testes | Consumo idempotente, retry e DLQ, painéis, tracing, cenários k6 |

## Marcos até o Projeto 03

| Até | Marco | Principais responsáveis |
|---|---|---|
| 13/11 | Contratos da API e dos eventos; login e seed funcionando | Deivily, Kaique |
| 20/11 | Reserva com disputa real; critério 1 passando | Everton |
| 27/11 | SAGA completa com pagamento e Circuit Breaker | Everton, Lucas |
| 04/12 | Eventos, notificações, cache e página web | Antonio, Kaique |
| 08/12 | Testes de carga e resiliência executados, resultados registrados | Antonio, com todos |
| 11/12 | Apresentação final ensaiada | Todos |

## Combinados

- O autor de cada commit é o responsável pela tarefa, e precisa ter revisado o conteúdo.
- Toda mudança passa pelo CI antes de entrar na `main`.
- O uso de IA fica registrado na seção própria do README.
