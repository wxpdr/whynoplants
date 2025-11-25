-- =========================================
-- V2: Seeds iniciais
-- - Admin backoffice
-- - Estoquista backoffice
-- - Cliente padrão
-- - Produtos iniciais
-- Senha de TODOS: admin123 (BCrypt já usado no projeto)
-- =========================================

/* ========== USUÁRIOS BACKOFFICE ========== */
INSERT INTO usuarios (nome, cpf, email, senha, status, grupo) VALUES
  ('Administrador',     '00000000001', 'admin@wnplants.com',
   '$2b$10$ZAOvtj6AvtcQYsAe.7XkmewjfP94Pws2eOK7MkydIWn4wimRaIZ9e', 1, 'Administrador'),
  ('Estoquista padrão', '00000000002', 'estoque@wnplants.com',
   '$2b$10$ZAOvtj6AvtcQYsAe.7XkmewjfP94Pws2eOK7MkydIWn4wimRaIZ9e', 1, 'Estoquista')
ON DUPLICATE KEY UPDATE email = VALUES(email);

/* ========== CLIENTE ========== */
INSERT INTO clientes (
  email, senha_hash, primeiro_nome, sobrenome,
  cpf, data_nascimento, genero
) VALUES (
  'cliente@wnplants.com',
  '$2b$10$ZAOvtj6AvtcQYsAe.7XkmewjfP94Pws2eOK7MkydIWn4wimRaIZ9e', -- senha: admin123
  'Cliente', 'Teste',
  '00000000003',
  '2000-01-01',
  'FEMININO'
)
ON DUPLICATE KEY UPDATE email = email;

/* ========== PRODUTOS (plantinhas) ========== */
INSERT INTO produtos (codigo, nome, quantidade, valor, ativo, criado_em, descricao, avaliacao) VALUES
('0001','Samambaia',           10, 39.90,1,NOW(),'Samambaia verdinha para interiores.',                 4.5),
('0002','Comigo Ninguém Pode', 10, 29.90,0,NOW(),'Planta ornamental tóxica, uso decorativo.',          4.0),
('0003','Aloe Vera (Babosa)',  10, 24.90,1,NOW(),'Babosa para uso ornamental (sem aplicação médica).', 4.8),
('0004','Espada de São Jorge', 10, 34.90,1,NOW(),'Planta resistente para ambiente interno.',           4.7),
('0005','Cacto Estrela',       10, 22.90,1,NOW(),'Cacto fofinho para decoração.',                      4.2)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
