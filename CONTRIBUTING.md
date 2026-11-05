# Guia de contribuição

Este guia define como a equipe do CineSeat trabalha no repositório. Os próximos PRs vão completar estas seções: hooks de commit, CI, templates de PR e regras para ferramentas de IA.

## Idioma

| O quê | Idioma |
|---|---|
| Código (identificadores, comentários, logs, saída de CLI) | Inglês |
| Mensagens de commit (tipo, escopo, descrição e corpo) | Inglês |
| Nomes de branches | Inglês |
| Documentação (README, ADRs, este guia) | Português |

## Como trabalhamos: mob programming

A equipe programa junta, numa única máquina, com todos presentes:

- **Driver:** quem está no teclado.
- **Navegadores:** os outros integrantes.
- **Autoria:** o driver é o autor do commit e os demais entram como coautores (`Co-authored-by`).

Antes de commitar, defina o driver:

```bash
pnpm mob lucas          # Lucas vira o driver; os outros 4 entram como coautores
pnpm mob                # mostra o driver atual e os coautores
pnpm mob trailers       # imprime as linhas Co-authored-by da sessão
pnpm mob off            # encerra a sessão
```

Os ids válidos estão em [`.github/team.json`](.github/team.json). O comando altera apenas a configuração local deste repositório (`git config --local`), sem mexer na configuração global da máquina.

**Rotação:** o driver troca a cada issue ou a cada ciclo de TDD (teste → implementação → refatoração). A meta é que cada integrante tenha cerca de 20% dos commits em cada entrega.

**Uso de IA:** quando uma ferramenta de IA escreve o código, o prompt começa com o nome de quem o escreveu e o commit sai no nome dessa pessoa, com a IA como coautora. A IA não cria, edita, commita nem dá push sem aprovação da equipe.

## Fluxo Git (GitHub Flow)

1. Crie uma branch curta a partir da `main`: `<type>/<issue-number>-<short-description>`, por exemplo `feat/12-seat-locking`.
2. Faça commits pequenos e atômicos: uma mudança lógica por commit.
3. Abra um PR para a `main`. Ele precisa de 1 aprovação e do CI verde.
4. Faça o merge com **Rebase and merge**. Isso preserva cada commit com o autor original.

## Padrão de commits ([Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/))

```
<type>(<scope>): <description>

[optional body: explain why, not what]

Co-authored-by: Name <email>
```

- **Descrição:** em inglês, no imperativo, em minúsculas, sem ponto final, com no máximo 72 caracteres.
- **Tipos:** `feat`, `fix`, `test`, `refactor`, `docs`, `chore`, `ci`, `build`, `perf`, `revert`.
- **Escopos:** `auth`, `catalog`, `reservations`, `payments`, `notifications`, `gateway`, `messaging`, `observability`, `infra`, `ci`, `docs`, `adr`, `deps`, `repo`.

Exemplos:

```
feat(reservations): hold seat with conditional update
test(payments): cover circuit breaker opening after timeouts
docs(adr): record seat locking strategy
```

## Definition of Done

Um PR está pronto quando:

- [ ] o teste foi escrito antes do código (TDD nas camadas `domain` e `application`);
- [ ] o CI está verde;
- [ ] o ADR correspondente foi criado ou atualizado, se alguma decisão de arquitetura mudou;
- [ ] o uso de IA foi registrado na descrição do PR.
