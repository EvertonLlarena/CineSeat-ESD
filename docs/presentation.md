# Roteiro da apresentação do Projeto 02

Duração exigida: **de 12 a 15 minutos**, com os 5 integrantes. Meta: **14 minutos**, para sobrar margem sem ficar abaixo do mínimo. A entrega não tem demonstração de negócio ainda: mostra o ambiente e as decisões.

| Tempo | Min | Quem | Conteúdo | Apoio |
|---|---|---|---|---|
| 0:00 | 2 | Kaique | Problema da estreia; solução; C4 nível 1; mudanças desde a proposta | [C4](architecture/c4.md) |
| 2:00 | 3 | Everton | Decisão central: quem garante o assento e por que não o Redis. SAGA e máquina de estados | [ADR-001](adr/ADR-001-seat-source-of-truth.md), [ADR-002](adr/ADR-002-orchestrated-saga.md) |
| 5:00 | 3 | Lucas | C4 nível 2. Pagamento síncrono e eventos assíncronos; Circuit Breaker; os 6 padrões | [ADR-003](adr/ADR-003-sync-payment-async-events.md), [padrões](patterns.md) |
| 8:00 | 3 | Antonio | Outbox; plano de testes; **demonstração:** ambiente no ar, smoke test e Grafana | [ADR-004](adr/ADR-004-outbox-polling.md), [testes](test-plan.md) |
| 11:00 | 3 | Deivily | Stack; **demonstração:** CI com Semgrep e Trivy; divisão da equipe; marcos; uso de IA | [stack](stack.md), [equipe](team.md), README |

## Preparação

- Gravar a demonstração do ambiente como reserva, caso algo falhe ao vivo.
- Ensaiar uma vez cronometrando: o limite de tempo é rigoroso.
- Todos devem conseguir explicar a atualização condicional e o que acontece em um timeout de pagamento.

## Perguntas prováveis

- **Por que não usar lock no Redis?** Ele pode ser perdido em failover (ADR-001).
- **O banco único não é ponto único de falha?** Sim, e aceitamos isso: sem ele, deixamos de vender, mas não vendemos errado.
- **O que acontece se o pagamento der timeout?** A reserva fica pendente, a recuperação consulta o resultado e, se preciso, anula a cobrança antes de liberar o assento.
- **Por que há uma SAGA com só um participante remoto?** Porque a recuperação e a compensação continuam necessárias (ADR-002).
- **O que fica faltando?** A lógica de negócio, que é o foco do Projeto 03. Hoje os serviços são esqueletos.
