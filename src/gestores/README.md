# Painel dos Gestores (`/gestores`)

Incorpora o relatório Power BI ("Publicar na Web") mostrando para cada usuário só as páginas do seu município.
Sem banco de dados: tudo fica em arquivos JSON nesta pasta, fora de `src/assets` (não são servidos publicamente).

| Arquivo | O que é |
| --- | --- |
| `paginas_gestores.json` | Mapeamento gestor → município → páginas (`pageName`) do relatório. Pode ser substituído pela versão gerada mais recente, sem alterações. |
| `config.json` | Chave `r` do link do Power BI, nomes/ícones das abas, duração da sessão e recorte do rodapé do Power BI. |
| `usuarios.json` | Logins com senha em hash (scrypt) e quais gestores cada um vê. Edite com o CLI abaixo. |

Os arquivos são relidos automaticamente quando mudam (não precisa reiniciar o Node).

## Acessos

```bash
node src/gestores/cli.js listar
node src/gestores/cli.js visoes                                   # gestores/municípios disponíveis
node src/gestores/cli.js criar mesquita2 --nome "Mesquita" --gestores G6
node src/gestores/cli.js criar mp --nome "Ministério Público" --gestores "*"
node src/gestores/cli.js criar cisbaf --nome "CISBAF" --master   # consolidado + todos os municípios
node src/gestores/cli.js senha mesquita                          # gera nova senha e derruba as sessões abertas
node src/gestores/cli.js desativar mesquita | ativar mesquita | remover mesquita
```

Sem `--senha`, uma senha aleatória é gerada e mostrada uma única vez. Depois de alterar, faça commit do
`usuarios.json` e rode o `deployment.sh`.

## Produção

Defina `GESTORES_SESSION_SECRET` no `.env` do docker-compose (ex.: `openssl rand -hex 32`).

## Limitação importante

"Publicar na Web" deixa o relatório público para quem tiver o link. O painel só entrega o link depois do login
e cada usuário só recebe as páginas do seu município, mas alguém com conhecimento técnico pode copiar a URL do
iframe e trocar o `pageName`. Para isolamento real, é preciso Power BI Embedded com RLS (exige capacidade paga).
