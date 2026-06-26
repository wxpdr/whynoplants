<h1 align="center">🌱 WNPlants</h1>

<p align="center">
  E-commerce de plantas desenvolvido com Java, Spring Boot, MySQL, HTML, CSS e JavaScript.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Finalizado-ff69b4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Back--End-Java%20%7C%20Spring%20Boot-ff69b4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Banco-MySQL-black?style=for-the-badge&logo=mysql" />
</p>

---

## ✨ Sobre o projeto

O **WNPlants** é um projeto de e-commerce voltado para a venda de plantas e produtos relacionados.

A aplicação simula uma loja virtual completa, contemplando tanto a experiência do usuário final quanto a rotina administrativa do sistema. O projeto possui fluxo de catálogo, carrinho, checkout, controle de estoque e área administrativa para gerenciamento de informações.

A proposta foi praticar a construção de uma aplicação web com separação entre front-end e back-end, persistência de dados em banco relacional e organização de um sistema com fluxo comercial.

---

## 🎯 Objetivo

Criar um e-commerce funcional para simular a venda de plantas, aplicando conceitos de desenvolvimento web, arquitetura em camadas, integração entre interface e servidor, banco de dados e organização de funcionalidades comerciais.

Além da parte técnica, o projeto também teve como objetivo estruturar uma experiência simples para o usuário, com navegação pelo catálogo, montagem de carrinho e finalização de pedido.

---

## 🧩 Funcionalidades

* Visualização de catálogo de produtos
* Carrinho de compras
* Fluxo de checkout
* Controle de estoque
* Área administrativa / backoffice
* Cadastro e gerenciamento de dados do sistema
* Integração entre front-end e back-end
* Persistência de dados em banco relacional
* Separação entre interface, regras de negócio e banco de dados

---

## 🛠️ Tecnologias utilizadas

<p align="left">
  <img src="https://skillicons.dev/icons?i=java,spring,mysql,html,css,js,maven,git,github,vscode" />
</p>

### Back-end

* **Java** — linguagem utilizada no back-end
* **Spring Boot** — framework principal da aplicação
* **Spring Web** — criação das rotas e recursos web
* **Spring Data JPA** — persistência e comunicação com o banco
* **Maven** — gerenciamento de dependências
* **application.yml** — configuração da aplicação

### Front-end

* **HTML5** — estrutura das páginas
* **CSS3** — estilização da interface
* **JavaScript** — interações e comunicação com o back-end
* **Interface baseada em protótipo visual**

### Banco de dados

* **MySQL** — banco de dados relacional utilizado no projeto

Banco utilizado:

```sql
wnplants
```

---

## 📁 Estrutura do projeto

A organização principal foi separada entre back-end e front-end:

```text
WNPlants/
├── backend/
│   └── ecommerce/
│       ├── src/
│       ├── pom.xml
│       └── application.yml
│
└── frontend/
    └── wnplants-ui/
        ├── index.html
        ├── css/
        ├── js/
        └── assets/
```

---

## 🔄 Fluxo geral da aplicação

```text
Usuário
  ↓
Interface front-end
  ↓
Requisições HTTP
  ↓
Back-end Spring Boot
  ↓
Regras de negócio
  ↓
Banco de dados MySQL
```

Essa estrutura ajuda a separar responsabilidades e facilita a manutenção, o entendimento do fluxo e a evolução do projeto.

---

## ⚙️ Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/wxpdr/whynoplants.git
```

### 2. Acesse a pasta do projeto

```bash
cd whynoplants
```

### 3. Configure o banco de dados

Crie um banco MySQL com o nome:

```sql
CREATE DATABASE wnplants;
```

Depois, ajuste as credenciais no arquivo de configuração:

```text
backend/ecommerce/src/main/resources/application.yml
```

Exemplo:

```yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/wnplants
    username: seu_usuario
    password: sua_senha

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

### 4. Execute o back-end

Acesse a pasta do back-end:

```bash
cd backend/ecommerce
```

Execute o projeto com Maven:

```bash
mvn spring-boot:run
```

O back-end será iniciado localmente pelo Spring Boot.

### 5. Execute o front-end

Acesse a pasta do front-end:

```bash
cd frontend/wnplants-ui
```

Abra o arquivo `index.html` no navegador ou utilize uma extensão como **Live Server** no VS Code.

---

## 🖥️ Demonstração

O projeto foi desenvolvido para execução local e não possui deploy publicado no momento.

Para visualizar a aplicação, é necessário configurar o banco de dados, executar o back-end com Spring Boot e abrir o front-end localmente no navegador.

---

## 💼 Tipo de projeto

Este é um projeto full stack desenvolvido com foco na simulação de um e-commerce.

Ele representa uma prática mais completa de desenvolvimento web, envolvendo front-end, back-end, banco de dados, fluxo de compra, controle de estoque, backoffice e organização de camadas.

---

## 🧠 Aprendizados

Durante o desenvolvimento deste projeto, pratiquei:

* organização de um projeto full stack;
* criação de aplicação com back-end em Java;
* uso de Spring Boot em um sistema web;
* integração entre front-end e back-end;
* persistência de dados com MySQL;
* criação de funcionalidades comerciais;
* desenvolvimento de catálogo, carrinho e checkout;
* estruturação de área administrativa;
* prática de arquitetura em camadas;
* organização de fluxo de usuário em e-commerce;
* documentação de um projeto mais complexo no GitHub.

---

## 🔮 Possíveis melhorias futuras

Algumas melhorias possíveis para versões futuras:

* adicionar deploy do back-end e front-end;
* melhorar a responsividade das telas;
* adicionar autenticação de usuários;
* melhorar a experiência visual do checkout;
* criar filtros e busca por produtos;
* adicionar testes automatizados;
* documentar rotas da API;
* melhorar mensagens de erro e validações;
* revisar acessibilidade;
* otimizar organização visual do catálogo;
* criar painel administrativo mais completo.

---

## 👩‍💻 Desenvolvedora

Projeto desenvolvido por **Wendy** 🌸

---

## 📄 Licença

Este projeto está disponível sob a licença MIT.

---

<p align="center">
  Projeto finalizado, feito com Java, Spring Boot, MySQL e uma boa dose de caos botânico organizado 🌱✨
</p>
