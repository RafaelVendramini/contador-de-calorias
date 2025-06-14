﻿# Contador de Calorias

Um aplicativo mobile desenvolvido com React Native e Expo para ajudar usuários a monitorarem sua ingestão calórica diária.

## 🚀 Funcionalidades

- **Autenticação de Usuários**
  - Cadastro de novos usuários
  - Login com email e senha
  - Gerenciamento de perfil
  - Alteração de senha

- **Controle de Calorias**
  - Registro de alimentos consumidos
  - Contagem automática de calorias diárias
  - Configuração de calorias diárias
  - Interface intuitiva para adicionar alimentos

- **Interface Moderna**
  - Design limpo e responsivo
  - Cards informativos
  - Navegação intuitiva
  - Feedback visual para ações do usuário

## 🛠️ Tecnologias Utilizadas

- **Frontend**
  - React Native
  - Expo
  - TypeScript
  - React Navigation

- **Banco de Dados**
  - SQLite
  - Expo SQLite

- **Estilização**
  - React Native StyleSheet
  - Componentes personalizados

## 📱 Telas do Aplicativo

1. **Login**
   - Autenticação de usuários existentes
   - Validação de campos
   - Link para cadastro

2. **Cadastro**
   - Criação de nova conta
   - Validação de dados
   - Login automático após cadastro

3. **Home**
   - Resumo de calorias diárias
   - Formulário para adicionar alimentos
   - Lista de alimentos consumidos
   - Acesso às configurações

4. **Configurações**
   - Edição de perfil
   - Alteração de senha
   - Logout

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/contador-de-calorias.git
```

2. Instale as dependências:
```bash
cd contador-de-calorias
npm install
```

3. Inicie o projeto:
```bash
npx expo start
```

## 📦 Estrutura do Projeto

```
src/
├── app/                 # Telas do aplicativo
├── components/          # Componentes reutilizáveis
├── contexts/            # Contextos React
├── database/            # Configuração e operações do banco de dados
├── types/               # Definições de tipos TypeScript
└── utils/               # Funções utilitárias
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Próximos Passos

- [ ] Implementar metas diárias de calorias
- [ ] Adicionar gráficos de consumo
- [ ] Criar categorias de alimentos
- [ ] Implementar busca de alimentos
- [ ] Adicionar exportação de relatórios
