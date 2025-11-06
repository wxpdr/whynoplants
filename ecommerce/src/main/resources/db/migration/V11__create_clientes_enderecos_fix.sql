-- Cria clientes e enderecos conforme as entidades do projeto

CREATE TABLE IF NOT EXISTS clientes (
  id               BIGINT PRIMARY KEY AUTO_INCREMENT,
  email            VARCHAR(255) NOT NULL,
  senha_hash       VARCHAR(255) NOT NULL,
  primeiro_nome    VARCHAR(120) NOT NULL,
  sobrenome        VARCHAR(120) NOT NULL,
  cpf              VARCHAR(11)  NOT NULL,
  data_nascimento  DATE         NOT NULL,
  genero           VARCHAR(20)  NOT NULL,
  CONSTRAINT uk_cliente_email UNIQUE (email),
  CONSTRAINT uk_cliente_cpf   UNIQUE (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enderecos (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  tipo        VARCHAR(20)  NOT NULL,
  cep         CHAR(8)      NOT NULL,
  logradouro  VARCHAR(255) NOT NULL,
  bairro      VARCHAR(120) NOT NULL,
  cidade      VARCHAR(120) NOT NULL,
  uf          CHAR(2)      NOT NULL,
  numero      VARCHAR(30)  NOT NULL,
  complemento VARCHAR(120),
  cliente_id  BIGINT       NOT NULL,
  CONSTRAINT fk_endereco_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- índices úteis
CREATE INDEX idx_cliente_nome ON clientes (primeiro_nome, sobrenome);
CREATE INDEX idx_endereco_cliente ON enderecos (cliente_id);
