PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('CC', 'TI', 'CE', 'PAS', 'NIT')),
    numero_documento VARCHAR(30) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    fecha_nacimiento TEXT,
    sexo TEXT CHECK (sexo IS NULL OR sexo IN ('M', 'F', 'O')),
    eps TEXT,
    rol TEXT NOT NULL DEFAULT 'afiliado'
        CHECK (rol IN ('afiliado', 'administrador')),
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

CREATE TABLE IF NOT EXISTS usuarios_tunja (
    tipo_documento VARCHAR(10) NOT NULL,
    numero_documento VARCHAR(30) NOT NULL,
    email VARCHAR(254) NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    telefono VARCHAR(30),
    eps VARCHAR(100),
    estado_afiliacion VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado_afiliacion IN ('pendiente', 'aprobado', 'rechazado')),
    comprobante_archivo TEXT,
    comprobante_tipo TEXT,
    comprobante_nombre TEXT,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tipo_documento, numero_documento)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_tunja_email
    ON usuarios_tunja (email);

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

CREATE TABLE IF NOT EXISTS resultados_procedimientos (
    id_resultado INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_documento VARCHAR(10) NOT NULL,
    numero_documento VARCHAR(30) NOT NULL,
    eps TEXT NOT NULL,
    procedimiento VARCHAR(120) NOT NULL,
    fecha_procedimiento TEXT NOT NULL,
    ips VARCHAR(120) NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('En proceso', 'Disponible')),
    informe TEXT NOT NULL,
    creado_por INTEGER NOT NULL,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resultado_administrador FOREIGN KEY (creado_por)
        REFERENCES usuarios (id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_resultados_usuario_fecha
    ON resultados_procedimientos (tipo_documento, numero_documento, fecha_procedimiento DESC);

CREATE INDEX IF NOT EXISTS idx_resultados_eps
    ON resultados_procedimientos (eps, fecha_procedimiento DESC);

CREATE TABLE IF NOT EXISTS convenios (
    id TEXT PRIMARY KEY,
    eps_id TEXT NOT NULL,
    eps_nombre TEXT NOT NULL,
    eps_sede TEXT NOT NULL,
    eps_direccion TEXT NOT NULL,
    ips_id TEXT NOT NULL,
    ips_nombre TEXT NOT NULL,
    ips_sede TEXT NOT NULL,
    ips_direccion TEXT NOT NULL,
    portafolio_id TEXT NOT NULL,
    portafolio_nombre TEXT NOT NULL,
    servicios_seleccionados TEXT NOT NULL,
    clausula_transporte INTEGER NOT NULL CHECK (clausula_transporte IN (0, 1)),
    estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_creacion TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_convenios_eps_fecha
    ON convenios (eps_nombre, fecha_creacion);
