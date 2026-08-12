# Arquitetura da primeira versão

```text
Celular (câmera ou matrícula digitada)
        │ HTTPS + JSON
        ▼
Google Apps Script (API)
        │ consulta / valida / bloqueia duplicidade
        ▼
Planilha Google
├── Alunos: cadastro principal
├── Registros: histórico imutável de entradas
├── Pedagogas: responsáveis e agrupamentos
└── Dashboard: indicadores e resumo operacional
```

## Responsabilidades

- **Interface web:** leitura do QR Code, consulta, confirmação e retorno visual. Não guarda a lista de alunos no aparelho.
- **Apps Script:** única camada autorizada a ler e escrever na planilha; valida matrícula, recupera os dados atuais do cadastro, usa trava contra gravações simultâneas e rejeita duplicidades.
- **Planilha:** fonte oficial do cadastro e do histórico. O dashboard é derivado de `Registros`.

## Fluxo de registro

1. A interface lê o texto do QR Code (a matrícula) ou recebe digitação manual.
2. Envia `consultarAluno` à API.
3. A API procura uma matrícula ativa na aba `Alunos` e devolve os dados para conferência.
4. Ao confirmar, a interface envia `registrarAtraso` com tipo e observação.
5. A API busca o aluno novamente, verifica os registros recentes e grava uma linha em `Registros` com data/hora do servidor.
6. Se já houver registro da matrícula dentro da janela configurada, nenhuma linha é criada.

## Decisões desta versão

- O QR Code contém somente a matrícula, evitando dados pessoais impressos no código.
- Data, hora, turma, turno e pedagoga são definidos no servidor para reduzir adulterações no celular.
- O histórico repete os dados do aluno no momento do registro. Assim, uma futura troca de turma não altera relatórios antigos.
- A trava do Apps Script protege contra dois celulares registrarem o mesmo aluno ao mesmo tempo.

## Evoluções recomendadas

- Autenticação restrita às contas institucionais.
- Identificação do funcionário que fez o lançamento.
- Cadastro administrativo de alunos e geração de QR Codes.
- Filtros e gráficos adicionais ou integração com Looker Studio.
- Registro de justificativas e fluxo de correção/cancelamento com auditoria.
