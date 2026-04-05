CREATE DATABASE IF NOT EXISTS fitflow2 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE fitflow2;

-- ============================================================
-- GYMS
-- ============================================================
CREATE TABLE IF NOT EXISTS gyms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    ciudad VARCHAR(100) DEFAULT NULL,
    foto VARCHAR(255) DEFAULT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    ultimo_login DATETIME,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admins_gyms (
    admin_id INT,
    gym_id INT,
    rol ENUM('DUENO','TRABAJADOR') NOT NULL,
    PRIMARY KEY (admin_id, gym_id),
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admins_perfil (
    admin_id INT PRIMARY KEY,
    edad INT,
    sexo ENUM('M','F','O'),
    direccion VARCHAR(255),
    foto VARCHAR(255),
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- AUDITORÍA
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    gym_id INT,
    entidad VARCHAR(50),
    entidad_id INT,
    accion VARCHAR(20),
    detalles JSON,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    edad INT CHECK (edad >= 0),
    sexo ENUM('M','F','O'),
    activo BOOLEAN DEFAULT TRUE,
    fecha_baja DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    INDEX idx_clientes_gym (gym_id)
) ENGINE=InnoDB;

-- ============================================================
-- CLASES
-- ============================================================
CREATE TABLE IF NOT EXISTS clases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    INDEX idx_clases_gym (gym_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clases_monitores (
    clase_id INT,
    admin_id INT,
    PRIMARY KEY (clase_id, admin_id),
    FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clases_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clase_id INT NOT NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME NOT NULL,
    aforo_maximo INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes_clases (
    cliente_id INT,
    clase_horario_id INT,
    fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cliente_id, clase_horario_id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (clase_horario_id) REFERENCES clases_horarios(id) ON DELETE CASCADE,
    INDEX idx_clientes_clases_clase (clase_horario_id)
) ENGINE=InnoDB;

-- ============================================================
-- PRECIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS precios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clase_id INT,
    nombre VARCHAR(150) NOT NULL,
    tipo_unidad ENUM('MES','CLASES','DIA','MEDIO_MES'),
    cantidad_unidad INT DEFAULT 1,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- PAGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    cliente_id INT NOT NULL,
    precio_id INT,
    clase_id INT,
    pagado BOOLEAN DEFAULT TRUE,
    importe DECIMAL(10,2) NOT NULL CHECK (importe >= 0),
    fecha_pago DATE NOT NULL,
    periodo_inicio DATE,
    periodo_fin DATE,
    metodo_pago ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','CHEQUE','CRIPTOMONEDA') DEFAULT 'EFECTIVO',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (precio_id) REFERENCES precios(id) ON DELETE SET NULL,
    FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE SET NULL,
    INDEX idx_pagos_fecha (fecha_pago),
    INDEX idx_pagos_estado (pagado, fecha_pago),
    INDEX idx_pagos_gym_cliente (gym_id, cliente_id)
) ENGINE=InnoDB;

-- ============================================================
-- PAGOS VENCIMIENTO (NUEVO)
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos_vencimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pago_id INT NOT NULL UNIQUE,
    fecha_vencimiento DATE NOT NULL,
    dias_atraso INT DEFAULT 0,
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    fecha_recordatorio DATETIME,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pago_id) REFERENCES pagos(id) ON DELETE CASCADE,
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_pagado (recordatorio_enviado)
) ENGINE=InnoDB;

-- ============================================================
-- MAQUINAS
-- ============================================================
CREATE TABLE IF NOT EXISTS maquinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    uso VARCHAR(200),
    cantidad INT DEFAULT 1 CHECK (cantidad >= 0),
    ubicacion VARCHAR(150),
    foto VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    cantidad INT DEFAULT 0 CHECK (cantidad >= 0),
    foto VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_producto_nombre_gym (nombre, gym_id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    INDEX idx_productos_gym (gym_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS productos_movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo_movimiento ENUM('COMPRA','VENTA','AJUSTE') NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_id INT,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- ECONOMÍA
-- ============================================================
CREATE TABLE IF NOT EXISTS ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    fuente_tipo VARCHAR(30),
    fuente_id INT,
    descripcion TEXT,
    importe DECIMAL(10,2) NOT NULL CHECK (importe >= 0),
    fecha DATE NOT NULL,
    admin_id INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_ingresos_fecha (fecha)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    fuente_tipo VARCHAR(30),
    fuente_id INT,
    descripcion TEXT,
    importe DECIMAL(10,2) NOT NULL CHECK (importe >= 0),
    fecha DATE NOT NULL,
    admin_id INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_gastos_fecha (fecha)
) ENGINE=InnoDB;

-- ============================================================
-- PASSWORD RESET
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset (
    admin_id INT,
    token VARCHAR(255),
    expiracion DATETIME,
    PRIMARY KEY (token),
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;