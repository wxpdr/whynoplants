CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario   BIGINT PRIMARY KEY AUTO_INCREMENT,
  nome         VARCHAR(120)  NOT NULL,
  cpf          CHAR(11)      NOT NULL UNIQUE,
  email        VARCHAR(160)  NOT NULL UNIQUE,
  senha        VARCHAR(100)  NOT NULL,
  `status`     TINYINT(1)    NOT NULL DEFAULT 1,
  grupo        VARCHAR(20)   NOT NULL,
  data_criacao TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
