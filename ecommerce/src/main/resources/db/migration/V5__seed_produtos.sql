INSERT INTO produtos (codigo, nome, quantidade, valor, ativo)
VALUES
('SMART-001','Smartphone Nebula X',  8, 1999.90, 1),
('SMART-002','Smartwatch Orion',    12,  899.00, 1),
('FONE-100','Fone StarSound',       25,  199.90, 1),
('CASE-050','Capa ShockProof',      40,   79.90, 1),
('CABO-USB','Cabo USB-C 1m',        60,   29.90, 1)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
