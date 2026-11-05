# ADR-003: Pagamento síncrono com Circuit Breaker e eventos assíncronos

**Status:** aceito · **Data:** 05/11/2026

## Contexto

A proposta inclui Circuit Breaker, que pressupõe chamada síncrona, e RabbitMQ, que pressupõe comunicação assíncrona. É preciso definir o que passa por cada caminho.

## Decisão

- **Síncrono (HTTP):** Reservas chama Pagamento com timeout (valor inicial: 2 s) e Circuit Breaker. O cliente está aguardando a resposta.
- **Assíncrono (RabbitMQ via Outbox):** fatos já ocorridos, como `seat.held`, `seat.released` e `reservation.confirmed`, vão para Notificações e para a invalidação do cache.

Valores iniciais do Circuit Breaker, que serão ajustados com os testes: abre com 50% de falhas em uma janela de 10 s (mínimo de 10 chamadas) e tenta meio-aberto depois de 15 s.

**Com o circuito aberto:** nenhuma cobrança é tentada e a API responde **503 com `Retry-After`**. A reserva continua em `HELD`, e o cliente pode tentar de novo até o fim do prazo. Sem cobrança, não há o que compensar.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| Tudo assíncrono, com comando de pagamento em fila | Elimina o papel do Circuit Breaker e obriga o cliente a acompanhar o resultado por polling |
| Tudo síncrono, inclusive notificações | Uma falha de e-mail afetaria a compra, aumentando acoplamento e latência |

## Consequências

- **Positivas:** o cliente recebe a resposta na hora, e as falhas de Notificações ou do broker não atrapalham a compra.
- **Negativas:** a disponibilidade da compra depende de Pagamento, e o sistema convive com dois modelos de comunicação. A queda rápida (*fail fast*) limita o impacto.

## Validação

Critério 5 do [plano de testes](../test-plan.md): queda e lentidão de Pagamento, além da recuperação pelo estado meio-aberto.
