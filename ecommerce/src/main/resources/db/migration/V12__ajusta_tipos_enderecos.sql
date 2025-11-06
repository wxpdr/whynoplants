-- Força mudança do tipo do CEP para VARCHAR(8)
ALTER TABLE enderecos
  MODIFY COLUMN cep VARCHAR(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Confirma o tipo da UF também (mantém coerência)
ALTER TABLE enderecos
  MODIFY COLUMN uf VARCHAR(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
