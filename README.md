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

## Indexação

O `.htaccess` na raiz envia o cabeçalho `X-Robots-Tag` para impedir que buscadores e ferramentas de IA indexem os previews quando hospedados em Apache.
