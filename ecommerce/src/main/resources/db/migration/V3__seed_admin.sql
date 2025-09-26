-- Seed de usuário administrador
INSERT INTO usuarios (nome, cpf, email, senha, status, grupo)
VALUES (
  'Administrador',
  '12345678901',
  'admin@wnplants.com',
  '$2b$10$ZAOvtj6AvtcQYsAe.7XkmewjfP94Pws2eOK7MkydIWn4wimRaIZ9e', -- senha: admin123
  1,
  'Administrador'
)
ON DUPLICATE KEY UPDATE email = email;
