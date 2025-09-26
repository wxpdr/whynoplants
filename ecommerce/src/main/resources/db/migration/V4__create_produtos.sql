-- Criação da tabela de produtos (compatível com MySQL 5.7+)
CREATE TABLE IF NOT EXISTS produtos (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  codigo      VARCHAR(32)  NOT NULL,
  nome        VARCHAR(150) NOT NULL,
  quantidade  INT          NOT NULL,
  valor       DECIMAL(12,2) NOT NULL,
  ativo       TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uk_produto_codigo UNIQUE (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_produto_nome  ON produtos (nome);
