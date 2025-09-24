
# Projeto Integrador - Spring Boot + MySQL

Este projeto foi desenvolvido como parte do **Projeto Integrador** da disciplina de Análise e Desenvolvimento de Sistemas. Ele consiste em uma aplicação **backoffice** para gestão de usuários e produtos, utilizando **Spring Boot** no back-end e **MySQL** para o banco de dados.

## 🏁 Sprint 1 – Concluída
A Sprint 1 foi dedicada à configuração inicial do projeto e à implementação do **CRUD de usuários**. O que foi feito até agora:

- **Estrutura do projeto** criada utilizando **Maven + Spring Boot**.
- **Banco de dados MySQL** integrado e funcionando com as tabelas necessárias.
- Implementação de **DTOs**: `UsuarioCreateDTO`, `UsuarioUpdateDTO` e `LoginRequest`.
- **CRUD completo** de usuários (Create, Read, Update, Delete).
- **Criptografia de senha** (SHA-256) implementada para armazenamento seguro.
- **Controller** e **Service** para a lógica do CRUD de usuários.
- **Testes básicos** de persistência e integração funcionando.

---

## ⚡ O que falta para encerrar a Sprint 1:
Ainda precisamos finalizar alguns pontos críticos da Sprint 1:

1. **Login e Sessão**:
   - Implementar a diferenciação de **perfil (Administrador / Estoquista)** no login.
   - Redirecionar o usuário para a tela correta conforme seu **perfil** após login.

2. **Listagem de Usuários**:
   - Exibir **status (ativo/inativo)** e **perfil** (Admin/Estoquista) na lista de usuários.
   - Implementar **filtro por nome de usuário** na listagem de usuários.

3. **Cadastro de Usuário**:
   - Adicionar **confirmação de senha** (senha digitada 2x).
   - Bloquear **cadastro de emails duplicados**.
   - Implementar **validação de CPF** (regex ou regra de negócio).

4. **Alteração de Usuário**:
   - Bloquear **alteração de email** no update de usuário.
   - Validar **senha atual** antes de permitir troca de senha.

5. **Habilitar/Desabilitar Usuário**:
   - Criar **endpoint** para **ativar/inativar** usuários.
   - Adicionar **confirmação** antes de efetivar a alteração de status.

---

## 🚀 Sprint 2 – Planejada
A Sprint 2 vai iniciar assim que a Sprint 1 for concluída. Algumas tarefas da Sprint 2 incluem:

- **Integração do backoffice** com o front-end para gestão de produtos.
- **Cadastro e listagem de produtos** com funcionalidades de **habilitar/inabilitar**.
- **Validações adicionais** (CPF, Email, etc.) e regras de negócio.
- **Desenvolvimento de endpoints** para manipulação de produtos e seus dados.

---

## 🔧 Tecnologias Utilizadas
- **Spring Boot** (back-end).
- **MySQL** (banco de dados).
- **SHA-256** (criptografia de senhas).
- **Maven** (gerenciamento de dependências).
- **JPA/Hibernate** (acesso a dados).

---

## 🚨 Como Rodar o Projeto
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/projeto-integrador.git
   ```

2. Configure o banco de dados no **MySQL**:
   - Crie o banco de dados `projeto_integrador` ou use um banco existente.
   - Atualize as credenciais no arquivo `application.properties`.

3. Execute o projeto com o comando Maven:
   ```bash
   mvn spring-boot:run
   ```

---

## 📂 Estrutura do Projeto
```
src/
 ├── main/
 │    ├── java/
 │    │    ├── com/
 │    │    │    ├── projeto/
 │    │    │    │    ├── ecommerce/
 │    │    │    │    │    ├── controller/
 │    │    │    │    │    ├── service/
 │    │    │    │    │    ├── model/
 │    │    │    │    │    └── repository/
 │    │    └── resources/
 │    │         ├── application.properties
 │    ├── test/
 └── pom.xml
```

---

## 📑 Contribuindo
Contribuições são bem-vindas! Se você tiver sugestões ou melhorias, por favor, abra uma **issue** ou envie um **pull request**.

```
- Siga a convenção de commits semânticos.
- Documente claramente qualquer alteração no README.
```

---

## 📞 Contato
Para mais informações, entre em contato com os desenvolvedores do projeto:

- **Wendy Pedrosa** – [LinkedIn](https://www.linkedin.com/in/wendypedrosa)
- **Nayra Rocha** – [LinkedIn](https://www.linkedin.com/in/nayra-rocha)
- **Pedro de Albuquerque** – [LinkedIn](https://www.linkedin.com/in/pedro-de-albuquerque)
