# Plano de testes

Revisa os critérios da proposta e garante que cada padrão tenha um teste. Os resultados serão registrados no Projeto 03.

## Condições comuns

- Registrar hardware, versões e commit de cada execução.
- **Rate limiting:** usar muitos usuários de teste e um limite configurado para o teste, registrando esse valor. Uma resposta 429 inesperada invalida a execução, pois a requisição nem chegou a Reservas.
- **Injeção de falhas:** Pagamento recebe taxa de falha e latência por variável de ambiente.

## Critérios de sucesso

| # | Critério | Cenário | Evidência |
|---|---|---|---|
| 1 | **0 vendas duplicadas** | 1.000 tentativas concorrentes para o mesmo assento, com 3 réplicas de Reservas | Exatamente 1 sucesso, 999 respostas 409, nenhum 5xx; consulta no banco confirma 1 reserva ativa |
| 2 | **p95 < 300 ms no mapa** | 200 VUs por 5 min, com reservas ocorrendo ao mesmo tempo | Limiar do k6, taxa de acerto do cache e comparação com o cache desligado |
| 3 | **100% compensado** | 1.000 compras com 30% de falhas, timeouts e `docker kill` de Reservas durante a cobrança | Ao fim, nenhuma reserva presa; todo assento sem pagamento aprovado está livre; nenhuma cobrança aprovada sem assento |
| 4 | **Liberação em até 5 s** | Reservas abandonadas, sem pagamento | Diferença entre `hold_expires_at` e o horário de liberação |
| 5 | **Circuit Breaker** | Pagamento parado (`docker stop`) e depois lento (latência injetada) | Com o circuito aberto, resposta 503 em menos de 1 s; p95 do Catálogo inalterado; recuperação automática quando Pagamento volta |
| 6 | **Idempotência** | 50 reenvios simultâneos com a mesma `Idempotency-Key` | 1 reserva e 1 cobrança |

## Testes por padrão

| # | Padrão | Cenário | Evidência |
|---|---|---|---|
| P1 | Outbox | Derrubar o RabbitMQ durante a carga e religar | Compras seguem funcionando; todos os eventos publicados depois da volta; 0 perdidos |
| P2 | Retry e DLQ | Provedor de e-mail falhando, de forma temporária e permanente | Sucesso após retry no primeiro caso; DLQ após 3 tentativas no segundo; reprocessamento sem e-mail duplicado |
| P3 | Gateway | Token ausente, expirado ou adulterado; rajada acima do limite | Respostas 401 e 429; serviços internos inacessíveis de fora |

## Experimentos comparativos

| # | Pergunta | Método |
|---|---|---|
| E1 | Qual estratégia de concorrência se comporta melhor na disputa? | Atualização condicional, `SELECT FOR UPDATE` e lock no Redis, sob a mesma carga: throughput, p95 e correção |
| E2 | Quanto o cache realmente ajuda? | Mapa com e sem cache, e com TTLs diferentes |

## Níveis de teste

| Nível | Ferramenta | Quando roda |
|---|---|---|
| Unitário e de contrato | Vitest | CI, em todo push para `main` e em todo PR |
| Fumaça do ambiente | `scripts/smoke.sh` | CI, em todo push para `main` e em todo PR |
| Segurança | Semgrep, Trivy | CI, em todo push para `main` e em todo PR |
| Integração do fluxo completo | Vitest com o ambiente Compose | CI, a partir do Projeto 03 |
| Carga e resiliência | k6, `docker stop` e `docker kill` | Sob demanda, com resultados registrados |
