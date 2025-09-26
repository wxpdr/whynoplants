-- Tabela de imagens do produto (múltiplas, com uma principal)
CREATE TABLE IF NOT EXISTS produto_imagens (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  produto_id BIGINT NOT NULL,
  arquivo    VARCHAR(255) NOT NULL,               -- caminho relativo para servir
  principal  TINYINT(1) NOT NULL DEFAULT 0,
  ordem      INT NOT NULL DEFAULT 0,
  criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pi_produto FOREIGN KEY (produto_id)
    REFERENCES produtos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pi_produto ON produto_imagens(produto_id);
