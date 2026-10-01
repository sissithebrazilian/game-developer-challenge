# Arquitetura do Projeto

## Visão geral

Este projeto é um jogo naval 2D desenvolvido com React, TypeScript e PixiJS.

A aplicação foi dividida em duas responsabilidades principais:

- React cuida das telas da aplicação, navegação, opções, ranking, histórico de partidas e resultados.
- PixiJS cuida do jogo em tempo real, renderização, movimentação, inimigos, projéteis, colisões e loop principal.

Essa separação foi feita para evitar que o React seja responsável pela atualização do jogo a cada frame.

---

## Tecnologias principais

### React

O React é responsável pelas telas da aplicação:

- Menu principal
- Jogo
- Opções
- Resultados
- Ranking
- Histórico de partidas

Também controla a troca entre essas telas e as configurações da partida.

---

### TypeScript

TypeScript é utilizado em todo o projeto para melhorar a segurança dos tipos e reduzir erros.

Alguns exemplos de estruturas tipadas:

- Resultado da partida
- Configurações do jogo
- Tipos de ataque
- Tipos de inimigos
- Dados das ilhas
- Props dos componentes

---

### PixiJS

PixiJS é responsável pela renderização e pela lógica em tempo real do jogo.

A resolução interna utilizada é:

```text
1280 x 720