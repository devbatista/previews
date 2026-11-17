# Previews

Repositório de previews estáticos (HTML/CSS/JS) de sites e sistemas, usados para apresentar layouts e protótipos navegáveis.

## Estrutura

```
previews/
├── sites/                      # Sites institucionais
│   └── romulo-contabil/        # Romulo · Serviços Contábeis
└── sys/                        # Sistemas / painéis
    ├── catalystops/
    │   ├── app/                # CatalystOps — aplicação
    │   └── admin/              # CatalystOps — painel administrativo
    ├── devbatista-admin/       # DevBatista — painel administrativo
    ├── rubyrose-eventos/       # Ruby Rose — credenciamento de eventos
    └── wa-facilities_oldest/   # WA Facilities (versão antiga)
```

Cada preview é independente: uma pasta com `index.html` e seus próprios `assets/`.

## Como visualizar

Abra o `index.html` do preview direto no navegador ou sirva a pasta localmente:

```bash
# na raiz do repositório
python3 -m http.server 8000
# acesse http://localhost:8000/sites/romulo-contabil/
```

## Adicionando um novo preview

1. Crie uma pasta em `sites/` (sites) ou `sys/` (sistemas) com um nome em kebab-case.
2. Coloque o `index.html` e os arquivos estáticos (`assets/`) dentro dela.
3. Use caminhos relativos para que o preview funcione em qualquer subdiretório.

## Visitas

Cada página carrega o script de visitas do site, antes do `</body>`:

```html
<script src="https://www.devbatista.com/js/visitas.js?v=3" defer></script>
```

As visitas vão para o Admin DevBatista (Marketing → Visitas do site → **Prévias de clientes**), fora dos números do site: quantas vezes cada prévia foi aberta, quanto tempo ficou aberta e quando foi a última vez. Nos sistemas (`sys/`), cada tela (o fragmento da URL, como `#resumo`) conta como uma página vista, então dá para ver por quais telas o cliente passou.

- Toda página nova de prévia precisa da linha acima, com o mesmo `?v=` das páginas do site (o repositório `devbatista_site` sobe esse número quando o script muda).
- Nos protótipos de sistema, use o fragmento para as telas (`#resumo`, `#/financeiro`), com letras, números, `-`, `_` e `/`. Outro formato é ignorado.
- Para não contar as suas próprias visitas, abra `https://www.devbatista.com/?nao-contar=1` uma vez em cada navegador: o cookie vale também aqui.
- Não há cookie nem IP guardado. Um link mandado a um cliente só mostra quando ele abriu, e esse é o objetivo.

## Indexação

O `.htaccess` na raiz envia o cabeçalho `X-Robots-Tag` para impedir que buscadores e ferramentas de IA indexem os previews quando hospedados em Apache.
