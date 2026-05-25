# 🌿 WNPlants

O **WNPlants** é um projeto acadêmico de e-commerce desenvolvido com foco na venda de plantas e produtos relacionados. A aplicação simula uma loja virtual completa, com funcionalidades de catálogo, carrinho, checkout, controle de estoque e backoffice administrativo.

Este projeto foi desenvolvido como parte dos estudos em Análise e Desenvolvimento de Sistemas, com o objetivo de aplicar conceitos de desenvolvimento web, arquitetura em camadas, integração entre front-end e back-end, persistência de dados e organização de um sistema com fluxo comercial.

---

## ✨ Sobre o projeto

A proposta do WNPlants é representar uma loja online voltada para o universo de plantas, trazendo uma experiência simples e funcional para o usuário final, além de recursos administrativos para gerenciamento interno.

O sistema foi pensado para contemplar tanto a jornada do cliente quanto a rotina de controle da loja, incluindo visualização de produtos, montagem de carrinho, finalização de pedido e gerenciamento de informações pelo backoffice.

---

## 🧩 Funcionalidades principais

- Visualização de catálogo de produtos
- Carrinho de compras
- Fluxo de checkout
- Controle de estoque
- Área administrativa / backoffice
- Cadastro e gerenciamento de dados do sistema
- Integração entre front-end e back-end
- Persistência de dados em banco relacional

---

## 🛠️ Tecnologias utilizadas

### Back-end

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Maven
- Banco de dados MySQL
- Arquivo de configuração `application.yml`

### Front-end

- HTML
- CSS
- JavaScript
- Interface baseada em protótipo visual
- Estrutura separada do back-end

### Banco de dados

- MySQL
- Nome do banco utilizado:

```sql
wnplants
```

---

## 📁 Estrutura do projeto

A organização principal do projeto ficou separada entre back-end e front-end:

```txt
WNPlants/
│
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

## ⚙️ Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/wnplants.git
cd WNPlants
```

---

### 2. Configurar o banco de dados

Crie um banco MySQL com o nome:

```sql
CREATE DATABASE wnplants;
```

Depois, ajuste as credenciais no arquivo:

```txt
backend/ecommerce/src/main/resources/application.yml
```

Exemplo de configuração:

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

---

### 3. Executar o back-end

Acesse a pasta do back-end:

```bash
cd backend/ecommerce
```

Execute o projeto com Maven:

```bash
mvn spring-boot:run
```

O back-end será iniciado localmente pelo Spring Boot.

---

### 4. Executar o front-end

Acesse a pasta do front-end:

```bash
cd frontend/wnplants-ui
```

Abra o arquivo `index.html` no navegador ou utilize uma extensão como **Live Server** no VS Code.

---

## 🖥️ Fluxo geral da aplicação

O projeto foi pensado com uma separação clara entre as responsabilidades:

```txt
Usuário
  ↓
Interface Front-end
  ↓
Requisições HTTP
  ↓
Back-end Spring Boot
  ↓
Regras de negócio
  ↓
Banco de dados MySQL
```

Essa estrutura permite que o sistema mantenha uma organização mais limpa, facilitando a manutenção, os testes e a evolução do projeto.

---

## 🎯 Objetivo acadêmico

O WNPlants teve como objetivo consolidar conhecimentos importantes do desenvolvimento de software, como:

- Organização de um projeto full stack
- Criação de uma aplicação com back-end em Java
- Uso de banco de dados relacional
- Integração entre interface e servidor
- Estruturação de funcionalidades comerciais
- Desenvolvimento de telas e fluxos de usuário
- Prática de arquitetura em camadas
- Simulação de um sistema real de e-commerce

---

## 📌 Status do projeto

✅ **Projeto finalizado**

Este projeto foi concluído como entrega acadêmica e não possui previsão de novas alterações ou manutenções futuras.

O repositório permanece disponível como registro de aprendizado, evolução técnica e documentação do desenvolvimento realizado.

---

## 🌱 Considerações finais

O WNPlants representa uma etapa importante no processo de aprendizado em desenvolvimento de sistemas. Mais do que apenas uma aplicação de e-commerce, ele serviu como prática para entender como diferentes partes de um sistema se conectam: interface, regras de negócio, banco de dados e organização estrutural.

Mesmo sendo um projeto acadêmico, ele ajudou a fortalecer a visão sobre desenvolvimento web, planejamento de funcionalidades e construção de aplicações com propósito.

---

## 👩‍💻 Desenvolvido por

Projeto desenvolvido por **Wendy** como parte dos estudos em **Análise e Desenvolvimento de Sistemas**.

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e educacionais.
