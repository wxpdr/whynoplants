-- Seed inicial de produtos (WhyNoPlants)
-- Compatível com o schema atual de produtos (id, codigo, nome, quantidade, valor, ativo, criado_em)

INSERT INTO produtos (codigo, nome, quantidade, valor, ativo, criado_em) VALUES
('0005','Cacto Estrela',10,22.90,1,'2025-10-10 15:56:29'),
('0004','Espada de São Jorge',10,34.90,1,'2025-10-10 15:56:29'),
('0003','Aloe Vera (Babosa)',10,24.90,1,'2025-10-10 15:56:29'),
('0002','Comigo Ninguém Pode',10,29.90,0,'2025-10-10 15:56:29'),
('0001','Samambaia',10,39.90,1,'2025-10-10 15:56:29'),
('0006','Girassol',15,49.90,1,'2025-10-10 20:41:59'),
('0007','Margarida',10,32.90,1,'2025-10-10 20:46:18'),
('0008','Tulipa',10,59.90,1,'2025-10-10 20:47:17'),
('0009','Rosa',10,44.90,1,'2025-10-10 20:47:50'),
('0010','Suculenta',10,19.90,1,'2025-10-10 20:48:39'),
('0011','Violeta',10,27.90,1,'2025-10-10 20:49:36'),
('0012','Lavanda',10,42.90,1,'2025-10-10 20:50:57');
