# ADR-001: PostgreSQL como fonte da verdade do assento

**Status:** aceito · **Data:** 05/11/2026

## Contexto

A garantia central do CineSeat é vender cada assento uma única vez, mesmo com disputa concorrente e várias réplicas do serviço de Reservas. A proposta do Projeto 01 previa um bloqueio temporário com TTL no Redis. Também não definia qual serviço é dono do estado do assento: o mapa estava no Catálogo, mas a reserva está em Reservas.

Um bloqueio no Redis não sustenta sozinho essa garantia. Em um failover, a replicação assíncrona pode perder o bloqueio, e dois clientes podem acreditar que venceram.

## Decisão

1. O serviço de **Reservas é dono do estado de cada assento**. O Catálogo fica com filmes, sessões e layout.
2. A disputa é decidida por uma **atualização condicional atômica** no PostgreSQL:

```sql
UPDATE session_seats
SET status = 'HELD', reservation_id = $1, hold_expires_at = now() + interval '5 minutes'
WHERE session_id = $2 AND seat_id = $3
  AND (status = 'AVAILABLE' OR (status = 'HELD' AND hold_expires_at < now()));
```

Uma linha afetada significa que a reserva venceu. Nenhuma linha afetada gera uma resposta 409.

3. O **Redis fica fora do caminho crítico**: guarda apenas o cache do mapa e os contadores de rate limit.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Lock com TTL no Redis | Pode perder o bloqueio em failover, e o TTL pode vencer durante o pagamento |
| `SELECT ... FOR UPDATE` | Também é correto, mas mantém o lock por mais tempo e gasta um round-trip a mais |
| Coluna de versão (bloqueio otimista) | Também é correto, mas exige ler antes de escrever, sem ganho para este caso |

## Consequências

- **Positivas:** a garantia não depende do Redis; uma reserva vencida pode ser retomada sem esperar a varredura; o mecanismo é simples de testar.
- **Negativas:** toda disputa passa pelo banco de Reservas, que vira gargalo e ponto único de falha da escrita. Aceitamos isso: sem esse banco, o sistema deixa de vender, mas não vende errado.
- **Duplicação controlada:** Catálogo e Reservas recebem os mesmos assentos no seed.

## Validação

Critério 1 do [plano de testes](../test-plan.md). O experimento comparativo E1 mede as alternativas sob a mesma carga. Os números serão registrados aqui no Projeto 03.
