# Portal do Cliente · Criaê Marketing

Mini site onde cada cliente acessa **Onboarding**, **Briefing**, **Feedback** e o **Portfólio** da Criaê.

## Link de cada cliente

```
https://<endereço-do-site>/?c=<slug>
```

Exemplo: `?c=ketellen` mostra "Olá, Ketellen!". Sem `?c=`, o portal abre com uma saudação geral.

## Onde mexer

| Arquivo | O que tem |
|---|---|
| `dados/clientes.js` | Lista de clientes (nome + slug), gerada do banco **CLIENTES [AD]** no Notion |
| `dados/config.js` | Links dos formulários de Briefing e Feedback no Notion e WhatsApp da equipe |
| `dados/onboarding.js` | Textos da experiência de Onboarding: etapas, combinados e equipe |
| `assets/onboarding.*` | Animação de boas-vindas e passo a passo (não precisa mexer) |
| `dados/portfolio.js` | Trabalhos do portfólio (título, categoria, descrição, imagem, link) |
| `portfolio/` | Pasta para as imagens do portfólio |
| `feedback-google.html` | Página antiga de feedback (Google Forms), mantida como referência |

## Onboarding

O botão Onboarding abre uma experiência de boas-vindas: explosão de estrelas com som, o nome do cliente, o passo a passo de como a Criaê trabalha, os combinados e a equipe. No fim, leva ao Briefing.
Link direto: `?c=<slug>&boasvindas`.

## Formulários no Notion

Os formulários ficam em **Agência Criaê**, cada um com seu banco de respostas:

- ONBOARDING · Portal do Cliente
- BRIEFING · Portal do Cliente
- FEEDBACK · Portal do Cliente

Cada resposta tem a coluna **Cliente** (ligada ao CLIENTES [AD]) para a equipe vincular ao cliente certo, e **Status interno** para acompanhar.

## Novo cliente

1. Cadastre no CLIENTES [AD] com Status = "Cliente".
2. Peça ao Claude para "sincronizar os clientes do portal", ou adicione uma linha em `dados/clientes.js`.
3. Envie o link `?c=<slug>` ao cliente.
