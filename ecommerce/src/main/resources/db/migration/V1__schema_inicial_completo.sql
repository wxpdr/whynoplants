-- =========================================
-- V1: Schema inicial para Sprints 1 a 6
-- =========================================

/* ================== USUÁRIOS BACKOFFICE (Sprint 1) ================== */
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario   BIGINT NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(120)  NOT NULL,
  cpf          VARCHAR(11)   NOT NULL,
  email        VARCHAR(160)  NOT NULL,
  senha        VARCHAR(100)  NOT NULL,
  status       TINYINT(1)    NOT NULL DEFAULT 1,
  grupo        VARCHAR(20)   NOT NULL,
  data_criacao TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_usuarios        PRIMARY KEY (id_usuario),
  CONSTRAINT uq_usuarios_cpf    UNIQUE (cpf),
  CONSTRAINT uq_usuarios_email  UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ================== PRODUTOS (Sprints 2 e seguintes) ================== */
CREATE TABLE IF NOT EXISTS produtos (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  codigo      VARCHAR(32)   NOT NULL,
  nome        VARCHAR(150)  NOT NULL,
  quantidade  INT           NOT NULL,
  valor       DECIMAL(12,2) NOT NULL,
  ativo       TINYINT(1)    NOT NULL DEFAULT 1,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descricao   VARCHAR(2000) NULL,
  avaliacao   DECIMAL(2,1)  NULL,  -- validado na aplicação (1..5, passo 0.5)

  CONSTRAINT uk_produto_codigo UNIQUE (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_produto_nome   ON produtos (nome);
CREATE INDEX idx_produto_codigo ON produtos (codigo);

/* ========== IMAGENS DE PRODUTO (Sprint 2 – várias imagens) ========== */
CREATE TABLE IF NOT EXISTS produto_imagens (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  produto_id BIGINT       NOT NULL,
  arquivo    VARCHAR(255) NOT NULL,
  principal  TINYINT(1)   NOT NULL DEFAULT 0,
  ordem      INT          NOT NULL DEFAULT 0,
  criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_pi_produto FOREIGN KEY (produto_id)
    REFERENCES produtos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pi_produto ON produto_imagens(produto_id);

/* ================== CLIENTES / ENDEREÇOS (Sprint 4) ================== */
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
  cep         VARCHAR(8)   NOT NULL,
  logradouro  VARCHAR(255) NOT NULL,
  bairro      VARCHAR(120) NOT NULL,
  cidade      VARCHAR(120) NOT NULL,
  uf          VARCHAR(2)   NOT NULL,
  numero      VARCHAR(30)  NOT NULL,
  complemento VARCHAR(120),
  cliente_id  BIGINT       NOT NULL,

  CONSTRAINT fk_endereco_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_cliente_nome     ON clientes (primeiro_nome, sobrenome);
CREATE INDEX idx_endereco_cliente ON enderecos (cliente_id);

/* ================== PEDIDOS / CARRINHO (Sprints 3, 5 e 6) ==================
   - Um "pedido" com status CARRINHO representa o carrinho em aberto.
   - S5: finalização muda status para AGUARDANDO_PAGAMENTO.
   - S6: Estoquista altera status para os demais.
======================================================================= */

CREATE TABLE IF NOT EXISTS pedidos (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  cliente_id     BIGINT       NOT NULL,
  endereco_id    BIGINT       NULL,
  data_criacao   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status         VARCHAR(30)  NOT NULL, -- CARRINHO, AGUARDANDO_PAGAMENTO, ...
  forma_pagamento VARCHAR(20) NULL,     -- ex: BOLETO, CARTAO
  frete_opcao    VARCHAR(30)  NULL,     -- ex: ECONOMICO, EXPRESSO
  frete_valor    DECIMAL(12,2) NOT NULL DEFAULT 0,
  valor_itens    DECIMAL(12,2) NOT NULL DEFAULT 0,
  valor_total    DECIMAL(12,2) NOT NULL DEFAULT 0,

  CONSTRAINT fk_pedido_cliente  FOREIGN KEY (cliente_id)  REFERENCES clientes(id),
  CONSTRAINT fk_pedido_endereco FOREIGN KEY (endereco_id) REFERENCES enderecos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pedido_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedido_status  ON pedidos(status);

/* ================== ITENS DO PEDIDO (Carrinho + Pedido) ================== */
CREATE TABLE IF NOT EXISTS pedido_itens (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  pedido_id     BIGINT       NOT NULL,
  produto_id    BIGINT       NOT NULL,
  quantidade    INT          NOT NULL,
  valor_unitario DECIMAL(12,2) NOT NULL,
  valor_total   DECIMAL(12,2)  NOT NULL,

  CONSTRAINT fk_item_pedido  FOREIGN KEY (pedido_id)
    REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (produto_id)
    REFERENCES produtos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_item_pedido  ON pedido_itens(pedido_id);
CREATE INDEX idx_item_produto ON pedido_itens(produto_id);

/* ================== HISTÓRICO DE STATUS (Sprint 6) ================== */
CREATE TABLE IF NOT EXISTS pedido_status_historico (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  pedido_id   BIGINT      NOT NULL,
  status      VARCHAR(30) NOT NULL,
  alterado_em DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_hist_pedido FOREIGN KEY (pedido_id)
    REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hist_pedido ON pedido_status_historico(pedido_id);
