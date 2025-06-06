# API de Barbearia

API RESTful para sistema de agendamento de barbearia com funcionalidades de cadastro, login, escolha de serviços, agendamento, upload de imagens e avaliações.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- JWT para autenticação
- Multer para upload de imagens
- Nodemailer para simulação de envio de e-mails

## Instalação

1. Clone o repositório
2. Instale as dependências

```bash
cd barbearia
cd backend
npm install
```

3. Configure o MongoDB:

   a. Instale o MongoDB em seu sistema:
      - Para Windows: [Guia de instalação do MongoDB para Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
      - Para macOS: [Guia de instalação do MongoDB para macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
      - Para Linux: [Guia de instalação do MongoDB para Linux](https://docs.mongodb.com/manual/administration/install-on-linux/)

   b. Inicie o serviço do MongoDB:
      - Windows: O serviço deve iniciar automaticamente após a instalação
      - macOS: Execute `brew services start mongodb-community`
      - Linux: Execute `sudo systemctl start mongod`

   c. Verifique se o MongoDB está rodando:
      - Execute `mongo` no terminal para abrir o shell do MongoDB
      - Se conectar com sucesso, o MongoDB está funcionando corretamente

   d. Configure as variáveis de ambiente no arquivo `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/barbearia
JWT_SECRET=barbeariaSecretKey2025
JWT_EXPIRE=30d
EMAIL_SERVICE=console
```

   e. Você pode modificar a string de conexão `MONGO_URI` se:
      - Estiver usando um serviço MongoDB em nuvem como MongoDB Atlas
      - Tiver configurado usuário e senha para o MongoDB local
      - Estiver usando uma porta diferente da padrão (27017)

   Exemplo com MongoDB Atlas:
   ```
   MONGO_URI=mongodb+srv://usuario:senha@cluster0.mongodb.net/barbearia?retryWrites=true&w=majority
   ```

4. Inicie o servidor:

```bash
npm start
```

## Estrutura do Projeto

```
barbearia/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── agendamentos.js
│   │   ├── auth.js
│   │   ├── avaliacoes.js
│   │   └── servicos.js
│   ├── middleware/
│   │   ├── async.js
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── Agendamento.js
│   │   ├── Avaliacao.js
│   │   ├── Servico.js
│   │   └── User.js
│   ├── routes/
│   │   ├── agendamentos.js
│   │   ├── auth.js
│   │   ├── avaliacoes.js
│   │   └── servicos.js
│   ├── utils/
│   │   ├── errorResponse.js
│   │   ├── fileUpload.js
│   │   └── sendEmail.js
│   ├── uploads/
│   │   └── referencias/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── assets/
    ├── css/
    ├── js/
    └── index.html
```

## Endpoints da API

### Autenticação

#### Cadastro de Usuário
- **URL**: `/api/auth/register`
- **Método**: `POST`
- **Descrição**: Cadastra um novo usuário e envia e-mail de confirmação
- **Corpo da Requisição**:
  ```json
  {
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "telefone": "(11) 99999-9999",
    "senha": "senha123"
  }
  ```
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Login de Usuário
- **URL**: `/api/auth/login`
- **Método**: `POST`
- **Descrição**: Autentica um usuário e retorna um token JWT
- **Corpo da Requisição**:
  ```json
  {
    "email": "usuario@exemplo.com",
    "senha": "senha123"
  }
  ```
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Confirmação de E-mail
- **URL**: `/api/auth/confirmar-email/:token`
- **Método**: `GET`
- **Descrição**: Confirma o e-mail do usuário através do token enviado
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "message": "E-mail confirmado com sucesso"
  }
  ```

#### Obter Usuário Atual
- **URL**: `/api/auth/me`
- **Método**: `GET`
- **Descrição**: Retorna os dados do usuário autenticado
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f7c...",
      "nome": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "telefone": "(11) 99999-9999",
      "emailConfirmado": true,
      "createdAt": "2023-05-20T10:00:00.000Z"
    }
  }
  ```

#### Logout
- **URL**: `/api/auth/logout`
- **Método**: `GET`
- **Descrição**: Realiza o logout do usuário (limpa o cookie)
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

### Serviços

#### Listar Todos os Serviços
- **URL**: `/api/servicos`
- **Método**: `GET`
- **Descrição**: Retorna todos os serviços disponíveis
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "_id": "5f7c...",
        "nome": "Corte de Cabelo",
        "descricao": "Corte masculino tradicional",
        "preco": 35,
        "duracao": 30,
        "tipo": "corte",
        "disponivel": true,
        "createdAt": "2023-05-20T10:00:00.000Z"
      },
      {
        "_id": "5f7d...",
        "nome": "Barba",
        "descricao": "Aparar e modelar barba",
        "preco": 25,
        "duracao": 20,
        "tipo": "barba",
        "disponivel": true,
        "createdAt": "2023-05-20T10:00:00.000Z"
      },
      {
        "_id": "5f7e...",
        "nome": "Combo (Corte + Barba)",
        "descricao": "Corte masculino + barba",
        "preco": 55,
        "duracao": 50,
        "tipo": "combo",
        "disponivel": true,
        "createdAt": "2023-05-20T10:00:00.000Z"
      }
    ]
  }
  ```

#### Obter Serviço Específico
- **URL**: `/api/servicos/:id`
- **Método**: `GET`
- **Descrição**: Retorna um serviço específico pelo ID
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f7c...",
      "nome": "Corte de Cabelo",
      "descricao": "Corte masculino tradicional",
      "preco": 35,
      "duracao": 30,
      "tipo": "corte",
      "disponivel": true,
      "createdAt": "2023-05-20T10:00:00.000Z"
    }
  }
  ```

### Horários

#### Listar Horários Disponíveis
- **URL**: `/api/horarios`
- **Método**: `GET`
- **Descrição**: Retorna os horários disponíveis para agendamento (simulação com horários fixos)
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "data": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
  }
  ```

### Agendamentos

#### Listar Agendamentos do Usuário
- **URL**: `/api/agendamentos`
- **Método**: `GET`
- **Descrição**: Retorna todos os agendamentos do usuário autenticado
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "5f7c...",
        "usuario": {
          "_id": "5f7c...",
          "nome": "Nome do Usuário",
          "email": "usuario@exemplo.com",
          "telefone": "(11) 99999-9999"
        },
        "servico": {
          "_id": "5f7c...",
          "nome": "Corte de Cabelo",
          "descricao": "Corte masculino tradicional",
          "preco": 35,
          "duracao": 30,
          "tipo": "corte"
        },
        "data": "2023-05-25T00:00:00.000Z",
        "horario": "10:00",
        "status": "agendado",
        "imagemReferencia": "1621500000000-imagem.jpg",
        "observacoes": "Preferência por corte curto",
        "createdAt": "2023-05-20T10:00:00.000Z"
      }
    ]
  }
  ```

#### Criar Agendamento
- **URL**: `/api/agendamentos`
- **Método**: `POST`
- **Descrição**: Cria um novo agendamento
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Corpo da Requisição**:
  ```json
  {
    "servico": "5f7c...",
    "data": "2023-05-25",
    "horario": "10:00",
    "observacoes": "Preferência por corte curto"
  }
  ```
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f7c...",
      "usuario": "5f7c...",
      "servico": "5f7c...",
      "data": "2023-05-25T00:00:00.000Z",
      "horario": "10:00",
      "status": "agendado",
      "observacoes": "Preferência por corte curto",
      "createdAt": "2023-05-20T10:00:00.000Z"
    }
  }
  ```

#### Upload de Imagem de Referência
- **URL**: `/api/agendamentos/:id/imagem`
- **Método**: `PUT`
- **Descrição**: Faz upload de uma imagem de referência para um agendamento
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Corpo da Requisição**: `multipart/form-data` com campo `imagem`
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f7c...",
      "usuario": "5f7c...",
      "servico": "5f7c...",
      "data": "2023-05-25T00:00:00.000Z",
      "horario": "10:00",
      "status": "agendado",
      "imagemReferencia": "1621500000000-imagem.jpg",
      "observacoes": "Preferência por corte curto",
      "createdAt": "2023-05-20T10:00:00.000Z"
    }
  }
  ```

### Avaliações

#### Listar Todas as Avaliações
- **URL**: `/api/avaliacoes`
- **Método**: `GET`
- **Descrição**: Retorna todas as avaliações
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "5f7c...",
        "usuario": {
          "_id": "5f7c...",
          "nome": "Nome do Usuário"
        },
        "agendamento": {
          "_id": "5f7c...",
          "servico": {
            "_id": "5f7c...",
            "nome": "Corte de Cabelo",
            "tipo": "corte"
          }
        },
        "nota": 5,
        "comentario": "Excelente atendimento!",
        "createdAt": "2023-05-20T10:00:00.000Z"
      }
    ]
  }
  ```

#### Criar Avaliação
- **URL**: `/api/avaliacoes`
- **Método**: `POST`
- **Descrição**: Cria uma nova avaliação para um agendamento concluído
- **Cabeçalhos**: `Authorization: Bearer <token>`
- **Corpo da Requisição**:
  ```json
  {
    "agendamento": "5f7c...",
    "nota": 5,
    "comentario": "Excelente atendimento!"
  }
  ```
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "5f7c...",
      "usuario": "5f7c...",
      "agendamento": "5f7c...",
      "nota": 5,
      "comentario": "Excelente atendimento!",
      "createdAt": "2023-05-20T10:00:00.000Z"
    }
  }
  ```

## Simulação de E-mail

No ambiente de desenvolvimento, os e-mails são simulados e exibidos no console do servidor. Não é necessário configurar um servidor SMTP real.

## Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para acessar rotas protegidas, é necessário incluir o token no cabeçalho da requisição:

```
Authorization: Bearer <token>
```

O token é obtido nas rotas de registro e login.

## Uploads de Imagens

As imagens de referência são armazenadas localmente na pasta `uploads/referencias/` e podem ser acessadas através da URL `/uploads/referencias/<nome_do_arquivo>`.

## Observações

- Esta API foi desenvolvida para fins de demonstração e teste local.
- Os horários disponíveis são fixos para simplificar a implementação.
- O envio de e-mails é simulado no console.
- As imagens são armazenadas localmente.


## Painel Administrativo (Gerenciamento de Serviços)

O sistema agora inclui um painel administrativo acessível diretamente pelo site, permitindo que usuários com a permissão de "admin" gerenciem os serviços oferecidos pela barbearia (adicionar, editar, visualizar e excluir).

### Como Designar um Usuário como Admin

Por padrão, todos os usuários são criados com a role "user". Para dar permissão de administrador a um usuário:

1.  Conecte-se ao seu banco de dados MongoDB (usando MongoDB Compass ou o shell `mongo`).
2.  Navegue até o banco `barbearia` e a coleção `users`.
3.  Encontre o documento do usuário que você deseja tornar administrador.
4.  Edite o documento e altere o valor do campo `role` de `"user"` para `"admin"`.
5.  Salve a alteração.

### Acessando e Usando o Painel Admin

1.  Faça login no site com a conta do usuário que agora possui a `role` de "admin".
2.  Após o login, um link "Painel Admin" aparecerá na barra de navegação.
3.  Clique no link "Painel Admin".
4.  Você verá duas seções:
    *   **Adicionar Novo Serviço:** Um formulário para cadastrar novos serviços com nome, descrição, preço, duração, tipo, **imagem** e disponibilidade.
    *   **Serviços Existentes:** Uma tabela listando todos os serviços cadastrados, com botões para "Editar" (incluindo a opção de alterar a imagem) e "Excluir" cada um.
5.  Use o formulário e os botões para gerenciar os serviços e suas imagens de forma autônoma.

### Exibição de Imagens

*   **Imagens dos Serviços:** As imagens cadastradas para cada serviço são exibidas na página pública de "Serviços". Se nenhuma imagem for enviada, uma imagem padrão (`default-servico.jpg`) será usada.
*   **Imagens de Referência (Usuário):** As imagens enviadas pelos usuários durante o agendamento podem ser visualizadas na seção "Meu Perfil", dentro dos detalhes de cada agendamento.

## Endpoints da API