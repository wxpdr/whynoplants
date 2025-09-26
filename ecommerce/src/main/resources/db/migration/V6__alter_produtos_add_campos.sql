-- Campos exigidos na história: descrição (2000) e avaliação (1..5 passo 0.5)
ALTER TABLE produtos
  ADD COLUMN descricao VARCHAR(2000) NULL,
  ADD COLUMN avaliacao DECIMAL(2,1) NULL;
-- Observação: regra de 1..5 e passo 0.5 será validada na aplicação.
