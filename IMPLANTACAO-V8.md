# Versão 8 — dashboard, alertas e QR Codes

## Novos arquivos do Apps Script

Além de atualizar `Código.gs`, crie no editor do Apps Script:

- um arquivo de script chamado `Analytics.gs`, copiando `apps-script/Analytics.gs`;
- um arquivo HTML chamado `Dashboard`, copiando `apps-script/Dashboard.html`.

Mantenha também `Admin.html`. Recoloque o ID real da planilha no `Code.gs` antes de executar qualquer função.

## Instalação

1. Atualize `Código.gs` e crie `Analytics.gs` e `Dashboard.html`.
2. Salve e execute `configurarPlanilha` uma vez. Isso cria `Configurações`, `Log de alertas` e as colunas de QR Code em `Alunos`.
3. Preencha a aba `Pedagogas`: coluna A com o nome exatamente como aparece em `Alunos` e coluna B com o e-mail institucional.
4. Na aba `Configurações`, informe `EMAIL_DIRECAO` e `EMAIL_RELATORIO_SEMANAL`. Vários endereços podem ser separados por vírgula.
5. Na planilha, atualize a página e use **Sistema de Atrasos > Instalar alertas automáticos**. Autorize o envio de e-mails.
6. Publique uma nova versão do aplicativo Web porque `registrarAtraso_` passou a processar alertas.

Esta versão mantém o hash otimizado em 1.000 ciclos. Se algum usuário foi criado quando o código ainda usava 12.000 ciclos, redefina sua senha pelo painel administrativo após a atualização.

## Dashboard

Abra **Sistema de Atrasos > Abrir dashboard analítico**. Ele oferece filtros por período, turma, turno e pedagoga, além de ranking, reincidências, comparações, evolução semanal/mensal e dias da semana.

## Alertas

- Ao atingir o limite de reincidência, a pedagoga e a direção recebem um e-mail. O padrão é 3 atrasos em 30 dias.
- Ao atingir o limite diário, a direção recebe um único alerta naquele dia. O padrão é 20 atrasos.
- O resumo diário é programado para aproximadamente 18h.
- O relatório semanal é programado para sexta-feira, aproximadamente 17h.
- Os valores podem ser alterados na aba `Configurações`.
- Envios realizados ficam registrados em `Log de alertas`.

## QR Codes automáticos

Use **Sistema de Atrasos > Atualizar QR Codes**. A aba `Alunos` recebe:

- `Conteúdo QR`: `IEE:ALUNO:MATRÍCULA`;
- `QR Code`: imagem pronta para impressão.

Somente o identificador é enviado ao serviço de geração de QR; nenhum nome, turma ou contato é enviado. A geração usa a API QuickChart e requer internet. Sempre teste uma amostra antes da impressão em massa.

## Observações

- Os alertas dependem das cotas diárias de e-mail do Google Apps Script.
- Horários de gatilhos são aproximados, não exatos.
- O dashboard lê a aba `Registros`; não altera o histórico.
- A planilha deve continuar com acesso geral `Restrito`.
