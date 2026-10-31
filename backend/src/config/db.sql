PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('CC', 'TI', 'CE', 'PAS')),
    numero_documento VARCHAR(30) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    fecha_nacimiento TEXT,
    sexo TEXT CHECK (sexo IS NULL OR sexo IN ('M', 'F', 'O')),
    eps TEXT,
    password_hash TEXT NOT NULL CHECK (
        length(password_hash) = 161 AND
        substr(password_hash, 33, 1) = ':' AND
        substr(password_hash, 1, 32) NOT GLOB '*[^a-fA-F0-9]*' AND
        substr(password_hash, 34, 128) NOT GLOB '*[^a-fA-F0-9]*'
    ),
    activo BOOLEAN NOT NULL DEFAULT 0,
    estado_registro VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado_registro IN ('pendiente', 'aprobado', 'rechazado')),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuarios_tipo_numero UNIQUE (tipo_documento, numero_documento)
);

CREATE TABLE IF NOT EXISTS sesiones (
    id_sesion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    creada_en INTEGER NOT NULL,
    ultima_actividad INTEGER NOT NULL,
    expira_en INTEGER NOT NULL,
    revocada_en INTEGER,
    CONSTRAINT fk_sesion_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_expiracion
    ON sesiones (id_usuario, expira_en);

CREATE TABLE IF NOT EXISTS citas (
    id_cita INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_cita TEXT NOT NULL UNIQUE,
    usuario_id TEXT NOT NULL,
    ips TEXT NOT NULL,
    servicio TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    modalidad TEXT NOT NULL CHECK (modalidad IN ('presencial', 'telemedicina')),
    costo INTEGER NOT NULL CHECK (costo >= 0),
    descuento_aplicado INTEGER NOT NULL DEFAULT 0 CHECK (descuento_aplicado >= 0),
    estado TEXT NOT NULL DEFAULT 'confirmada'
        CHECK (estado IN ('confirmada', 'cancelada')),
    creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_citas_ips_fecha_hora_confirmada
    ON citas (ips, fecha, hora)
    WHERE estado = 'confirmada';

CREATE INDEX IF NOT EXISTS idx_citas_usuario_fecha
    ON citas (usuario_id, fecha, hora);
