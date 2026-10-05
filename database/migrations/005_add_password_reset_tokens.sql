CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    token CHAR(64) NOT NULL,
    tipo_usuario ENUM('ADMIN', 'USUARIO_FINAL') NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    fecha_uso DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_password_reset_tokens_token (token),
    KEY idx_password_reset_tokens_email_used (email, usado),
    KEY idx_password_reset_tokens_expiration (fecha_expiracion)
) ENGINE=InnoDB;
