# Sistema de atrasos escolares

Aplicação web responsiva para ler a matrícula contida no QR Code da carteirinha, consultar o aluno em uma Planilha Google e registrar o atraso. Inclui consulta manual, painel por turma/turno/pedagoga e bloqueio de duplicidade por 5 minutos.

## Estrutura

```text
sistema-atrasos/
├── index.html
├── style.css
├── app.js
├── config.js
├── config.example.js
└── apps-script/
    ├── Code.gs
    └── appsscript.json
```

## 1. Preparar a Planilha Google

1. Crie uma planilha vazia no Google Sheets.
2. Copie o ID da URL: em `docs.google.com/spreadsheets/d/ID_DA_PLANILHA/edit`, copie somente `ID_DA_PLANILHA`.
3. Abra **Extensões > Apps Script**.
4. Cole o conteúdo de `apps-script/Code.gs` no arquivo `Code.gs`.
5. Troque `COLE_AQUI_O_ID_DA_PLANILHA` pelo ID copiado.
6. No Apps Script, execute uma vez a função `configurarPlanilha` e autorize o acesso. Ela cria/formata as abas **Alunos**, **Registros**, **Pedagogas** e **Dashboard**.
7. Na aba **Alunos**, cadastre uma pessoa por linha. Exemplo:

| Matrícula/ID | Nome | Turma | Turno | Pedagoga | Ativo |
|---|---|---|---|---|---|
| 2026001 | Ana Souza | 7º A | Manhã | Maria Silva | Sim |

O QR Code deve guardar somente a matrícula/ID (por exemplo, `2026001`). Formate a coluna de matrícula como **Texto simples** se os IDs puderem começar com zero.

## 2. Publicar o Apps Script

1. Clique em **Implantar > Nova implantação**.
2. Selecione **Aplicativo da Web**.
3. Em **Executar como**, escolha **Eu**.
4. Em **Quem pode acessar**, escolha **Qualquer pessoa**.
5. Implante, autorize e copie a URL que termina em `/exec`.
6. Se alterar `Code.gs` depois, use **Implantar > Gerenciar implantações > Editar > Nova versão**. Salvar o código não atualiza sozinho a versão publicada.

> A opção “Qualquer pessoa” permite registrar sem login Google. A API expõe somente a consulta por matrícula e o registro; não lista a base inteira. Para dados sensíveis ou exigências institucionais, use contas Google da escola e restrinja a implantação ao domínio.

## 3. Configurar e abrir no VS Code

1. Abra esta pasta no VS Code.
2. Em `config.js`, cole a URL `/exec` em `API_URL` e informe o nome da escola.
3. Use uma extensão de servidor local, como **Live Server**, para testar. Não abra apenas com duplo clique no HTML.
4. Para testar a câmera em outro celular, publique o site em um endereço **HTTPS**. A câmera normalmente funciona somente em HTTPS ou em `localhost`.

Hospedagens estáticas adequadas: GitHub Pages, Cloudflare Pages, Netlify ou Firebase Hosting. Envie os quatro arquivos da raiz (`index.html`, `style.css`, `app.js`, `config.js`).

## Uso diário

1. Abra o endereço do site no celular e permita o uso da câmera.
2. Toque em **Abrir câmera** e leia a carteirinha.
3. Confira aluno, turma, turno e pedagoga; acrescente uma observação se necessário.
4. Toque em **Registrar atraso**.

Se a mesma matrícula for registrada novamente em até 5 minutos, o servidor rejeita o lançamento. Para mudar esse período, altere `DUPLICATE_WINDOW_MINUTES` em `Code.gs` e publique uma nova versão.

## Campos das abas

- **Alunos:** Matrícula/ID, Nome, Turma, Turno, Pedagoga, Ativo.
- **Registros:** Data, Hora, Matrícula/ID, Nome, Turma, Turno, Pedagoga, Tipo de registro, Observação, Registrado em.
- **Pedagogas:** Pedagoga, E-mail, Turmas/Turnos.
- **Dashboard:** totais de hoje, últimos 7 dias e mês, além do agrupamento por turma, turno e pedagoga.

## Teste rápido antes de usar

- Cadastre um aluno e confirme que a matrícula está como texto.
- Abra no navegador, digite a matrícula manualmente e registre.
- Confirme a nova linha em **Registros**.
- Repita em menos de 5 minutos e confirme o aviso de duplicidade.
- Teste a câmera no celular pelo endereço HTTPS.

## Personalização do cabeçalho e rodapé

1. Crie a pasta `assets` na raiz do site, caso ainda não exista.
2. Salve a imagem do colégio como `assets/logo-colegio.png`.
3. Em `config.js`, ajuste `SCHOOL_NAME` e os campos `FOOTER_YEAR`, `FOOTER_TEAM`, `FOOTER_TEACHER` e `FOOTER_COORDINATION`.
4. Para ocultar uma linha do rodapé, deixe o valor correspondente vazio (`""`).

## Abas individuais das pedagogas

Ao salvar um registro, o Apps Script mantém a linha na aba geral `Registros` e também a envia para uma aba chamada `Pedagoga - Nome`. A aba individual é criada automaticamente no primeiro lançamento daquela pedagoga. O nome usado vem da coluna `Pedagoga` da aba `Alunos`; portanto, mantenha a escrita padronizada para evitar duas abas para a mesma pessoa.

Depois de substituir `Code.gs`, publique uma **nova versão** em **Implantar > Gerenciar implantações**. Não é necessário executar `configurarPlanilha` novamente e nenhum registro existente será apagado.
