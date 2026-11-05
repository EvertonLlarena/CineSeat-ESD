# Stack tecnológica

| Camada | Escolha | Justificativa | Trade-off aceito |
|---|---|---|---|
| Linguagem | TypeScript, Node.js 22 | Uma linguagem só reduz o custo de revisão entre as frentes, e os tipos protegem contratos | CPU intensiva não é o ponto forte; aqui a carga é principalmente de E/S |
| Framework HTTP | Fastify | Leve, rápido e com plugins de proxy, rate limit e JWT | Menos estrutura pronta que o NestJS; organização fica a cargo da equipe |
| Repositório | Monorepo com npm workspaces | Um único CI, e o `service-kit` compartilha health e métricas | Risco de acoplamento; o pacote fica restrito a infraestrutura, sem regra de negócio |
| Banco | PostgreSQL 17, um banco lógico por serviço | Atomicidade e `SKIP LOCKED` sustentam reserva, SAGA e Outbox | Em uma única instância (poupa recursos), é ponto único de falha do ambiente; o isolamento é lógico |
| Acesso a dados | SQL explícito com Kysely (previsto) | A atualização condicional é central e precisa ser visível | Mais código que um ORM |
| Cache e limites | Redis 8 | Cache-Aside e contadores compartilhados entre réplicas | Dado perdido é tolerável: o sistema fica mais lento, mas não incorreto |
| Mensageria | RabbitMQ 4 | Retry com TTL e DLQ nativos, adequados a eventos de domínio | Não reprocessa histórico como o Kafka, o que não é requisito |
| Circuit Breaker | opossum (previsto) | Biblioteca madura para Node.js | Estado por réplica, não compartilhado |
| Autenticação | JWT RS256 | Serviços validam com a chave pública, sem poder emitir tokens | Revogação difícil; mitigada com expiração curta |
| Containers | Docker Compose | Exigido pela especificação; `--scale` permite testar várias réplicas | Não demonstra orquestração como o Kubernetes, cujo custo não se justifica aqui |
| CI | GitHub Actions, Semgrep, Trivy | Integração direta com o repositório; SAST e SCA desde o início | Falsos positivos podem exigir triagem |
| Carga | k6 | Cenários em código e limiares de aprovação | k6 e sistema na mesma máquina competem por recursos; o hardware é registrado |
| Observabilidade | Prometheus, Grafana; OpenTelemetry e Jaeger (previstos) | Métricas sustentam os critérios, e o tracing mostra a SAGA ponta a ponta | Mais contêineres no ambiente local |
| Testes | Vitest | Rápido e com suporte direto a TypeScript | Nenhum relevante para o projeto |

Os itens "previstos" serão adicionados conforme a implementação do Projeto 03.
