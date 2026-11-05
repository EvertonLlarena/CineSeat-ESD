# ADR-004: Transactional Outbox por polling

**Status:** aceito · **Data:** 05/11/2026

## Contexto

Reservas precisa alterar o banco e publicar um evento. Fazer as duas operações separadamente pode perder o evento ou anunciar uma mudança que não foi gravada.

## Decisão

O evento é gravado na tabela `outbox`, na mesma transação da mudança de estado. Um publicador faz polling (valor inicial: a cada 200 ms), lê com `FOR UPDATE SKIP LOCKED`, publica com **publisher confirms** e só depois marca o evento como publicado.

A entrega é **pelo menos uma vez**. Por isso, cada consumidor registra o `event_id` em uma tabela de eventos processados, na mesma transação do seu efeito.

## Alternativas consideradas

| Alternativa | Por que não foi escolhida |
|---|---|
| CDC com Debezium | Menor latência e nenhuma carga de polling, mas exige Kafka Connect, infraestrutura desproporcional |
| Publicar direto depois do commit | Uma queda entre as duas operações perde o evento |

## Consequências

- **Positivas:** nenhum evento se perde se o broker cair, porque a compra continua e os eventos aguardam na tabela. A solução usa apenas o que já está na stack.
- **Negativas:** o polling adiciona latência (até um intervalo) e carga ao banco. Consumidores precisam descartar duplicatas, e a ordem global não é garantida. Eventos antigos precisam de limpeza periódica.

## Validação

Teste P1 do [plano de testes](../test-plan.md): derrubar o RabbitMQ durante a carga e conferir que nenhum evento se perdeu.
