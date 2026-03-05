# 🍽️ Foodiary API

API serverless moderna para rastreamento nutricional e gerenciamento de refeições, construída com TypeScript e serviços AWS. O Foodiary ajuda usuários a monitorar sua ingestão diária de alimentos, calcular metas nutricionais e acompanhar sua jornada de saúde.

## 🚀 Funcionalidades

- **Autenticação & Autorização**: Gerenciamento seguro de usuários com AWS Cognito (autenticação baseada em JWT)
- **Gerenciamento de Perfil**: Crie e gerencie perfis pessoais com métricas de saúde (altura, peso, gênero, idade)
- **Calculadora de Metas Nutricionais**: Calcule automaticamente metas nutricionais diárias (calorias, proteínas, carboidratos, gorduras) baseadas no perfil do usuário
- **Rastreamento de Refeições**: Registre e gerencie refeições diárias _(em breve)_
- **Reconhecimento de Alimentos com IA**: Identificação inteligente de alimentos e análise nutricional usando IA _(em breve)_
- **Recuperação de Senha**: Fluxo seguro de redefinição de senha com verificação por e-mail

## 🏗️ Arquitetura

Construído seguindo princípios de **Clean Architecture** com clara separação de responsabilidades:

```
src/
├── application/       # Lógica de negócio & casos de uso
│   ├── controllers/  # Controladores de requisições HTTP
│   ├── usecases/     # Operações de negócio
│   ├── entities/     # Modelos de domínio
│   └── services/     # Serviços de domínio
├── infra/            # Dependências externas
│   ├── database/     # Repositórios DynamoDB
│   ├── clients/      # Clientes AWS
│   └── gateways/     # Adaptadores de serviços externos
├── kernel/           # Framework core (DI, decorators)
└── main/             # Pontos de entrada & adaptadores
    └── functions/    # Handlers Lambda
```

## 🛠️ Tecnologias

- **Runtime**: Node.js 22.x com TypeScript
- **Framework**: Serverless Framework v4
- **Banco de Dados**: AWS DynamoDB (design single-table)
- **Autenticação**: AWS Cognito User Pools
- **API**: AWS API Gateway HTTP API
- **IaC**: CloudFormation (via Serverless Framework)
- **Bundler**: esbuild (builds rápidos)
- **Validação**: Schemas Zod
- **DI**: Sistema customizado de injeção de dependências com decorators

## 📋 Pré-requisitos

- Node.js 22.x ou superior
- Conta AWS com permissões apropriadas
- AWS CLI configurado
- Serverless Framework CLI (`npm install -g serverless`)

## 🚦 Começando

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd foodiary-api

# Instale as dependências
npm install
```

### Configuração

O projeto usa variáveis de ambiente gerenciadas pelo Serverless Framework. Configure suas definições em `sls/config/env.yml`.

### Deploy

```bash
# Deploy para ambiente de desenvolvimento
sls deploy

# Deploy para produção
sls deploy --stage prod

# Deploy de uma única função (mais rápido)
sls deploy function -f <function-name>
```

### Desenvolvimento Local

```bash
# Observar mudanças e recompilar
npm run build:watch

# Ver logs de uma função específica
sls logs -f <function-name> --tail
```

## 🔌 Endpoints da API

### Autenticação

| Método | Endpoint                        | Auth    | Descrição                                 |
| ------ | ------------------------------- | ------- | ----------------------------------------- |
| POST   | `/auth/sign-up`                 | Público | Criar nova conta de usuário               |
| POST   | `/auth/sign-in`                 | Público | Fazer login e obter tokens                |
| POST   | `/auth/refresh-token`           | Público | Renovar token de acesso                   |
| POST   | `/auth/forgot-password`         | Público | Solicitar redefinição de senha            |
| POST   | `/auth/confirm-forgot-password` | Público | Confirmar redefinição de senha com código |

### Conta

| Método | Endpoint | Auth    | Descrição                                    |
| ------ | -------- | ------- | -------------------------------------------- |
| POST   | `/me`    | Privado | Obter perfil do usuário e metas nutricionais |

### Refeições _(Em Breve)_

| Método | Endpoint     | Auth    | Descrição                       |
| ------ | ------------ | ------- | ------------------------------- |
| POST   | `/meals`     | Privado | Criar novo registro de refeição |
| GET    | `/meals`     | Privado | Listar refeições do usuário     |
| GET    | `/meals/:id` | Privado | Obter detalhes da refeição      |
| PUT    | `/meals/:id` | Privado | Atualizar refeição              |
| DELETE | `/meals/:id` | Privado | Deletar refeição                |

## 🤖 Recursos com IA _(Roadmap)_

- **Reconhecimento de Alimentos**: Upload de imagens de comida para identificação automática
- **Análise Nutricional**: Cálculo de valores nutricionais alimentado por IA
- **Sugestões de Refeições**: Recomendações personalizadas baseadas nas metas
- **Insights de Progresso**: Análises inteligentes sobre padrões nutricionais

## 🏛️ Estrutura do Projeto

### Design Single-Table do DynamoDB

O projeto usa o padrão single-table para performance otimizada:

```
PK: ACCOUNT#<accountId>
SK: ACCOUNT#<accountId>          -> Dados da conta
SK: ACCOUNT#<accountId>#PROFILE  -> Dados do perfil
SK: ACCOUNT#<accountId>#GOAL     -> Metas nutricionais
```

### Injeção de Dependências

Container DI customizado com decorators TypeScript:

```typescript
@Injectable()
export class MyService {
  constructor(private readonly dependency: Dependency) {}
}
```

### Lambda Triggers

- **PreTokenGeneration**: Adiciona claims customizadas (internalId) aos tokens JWT

## 📊 Schema do Banco de Dados

### Conta

- Email (único)
- ID do Usuário Cognito
- ID Interno da Conta

### Perfil

- Nome
- Data de Nascimento
- Gênero
- Altura (cm)
- Peso (kg)

### Meta

- Calorias Diárias
- Proteínas (g)
- Carboidratos (g)
- Gorduras (g)

## 🔐 Segurança

- Autenticação baseada em JWT com AWS Cognito
- Authorizer do API Gateway para endpoints protegidos
- Políticas de senha seguras
- Verificação de e-mail
- Mecanismo de renovação de tokens

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com cobertura
npm run test:coverage
```

## 📝 Variáveis de Ambiente

Gerenciadas em `sls/config/env.yml`:

- `DYNAMODB_MAIN_TABLE`: Nome da tabela principal do DynamoDB
- `COGNITO_USER_POOL_ID`: ID do User Pool do Cognito
- `COGNITO_CLIENT_ID`: ID do Cliente Cognito
- `COGNITO_CLIENT_SECRET`: Secret do Cliente Cognito

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

## 👨‍💻 Autor

Construído com ❤️ para uma vida mais saudável

---

**Nota**: Este projeto está em desenvolvimento ativo. Recursos de IA e capacidades avançadas de rastreamento de refeições chegarão em breve!
