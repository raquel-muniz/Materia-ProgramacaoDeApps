# Lembretes — React Native + Expo

Aplicativo acadêmico de lembretes com abas inferiores, armazenamento local e notificações locais.

## Requisitos
- Node.js LTS instalado
- Expo Go no celular ou emulador Android configurado

## Como executar
1. Extraia a pasta do projeto.
2. Abra um terminal dentro da pasta `lembretes-expo`.
3. Execute `npm install`.
4. Execute `npx expo install --fix` para alinhar os pacotes com a versão do Expo instalada.
5. Execute `npx expo start`.
6. Leia o QR Code com o Expo Go ou pressione `a` para abrir no emulador Android.

## Funcionalidades
- Criar lembrete com nome, descrição, horário e recorrência única/diária.
- Salvar os lembretes localmente com AsyncStorage.
- Agendar notificações locais.
- Concluir lembretes e cancelar sua notificação pendente.
- Adiar uma notificação por 10 minutos usando a ação da notificação do sistema.
- Cancelar todas as notificações pendentes ou reagendar um lembrete cancelado.
- Navegação por abas inferiores.

## Observações importantes
- Conceda a permissão de notificações quando o sistema solicitar.
- Para testar, configure um horário alguns minutos à frente.
- A notificação única usa a próxima ocorrência futura do horário informado; não há seleção de data neste protótipo.
- O botão “Adiar 10 min” aparece nas ações da notificação do sistema em plataformas que suportam categorias e ações de notificação. O comportamento pode variar entre Android, iOS, Expo Go e versões do sistema.
- O app não precisa de login nem de backend.
- O ícone de notificação configurado em `app.json` é opcional; se o arquivo `assets/notification-icon.png` não existir, remova a configuração `icon` do plugin ou crie esse recurso antes de gerar um build nativo.
- Em versões recentes do Android, notificações e alarmes exatos podem depender das permissões e das políticas do sistema. Para distribuição final, valide em um build de desenvolvimento ou APK próprio.
