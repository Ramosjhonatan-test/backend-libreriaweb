-- ========================
-- CREACIÓN DE TABLAS
-- ========================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) CHECK (rol IN ('admin', 'vendedor')),
  password_hash VARCHAR(255) NOT NULL,
  intentos_login INT DEFAULT 0,
  bloqueado BOOLEAN DEFAULT false
);

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  ci VARCHAR(15) UNIQUE NOT NULL CHECK (ci ~ '^[0-9]{7,10}$'),
  telefono VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  direccion TEXT,
  foto_url VARCHAR(255),
  fecha_contratacion DATE NOT NULL,
  puesto VARCHAR(50) NOT NULL CHECK (puesto IN ('vendedor', 'administrador')),
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  usuario_id INTEGER REFERENCES usuarios(id)
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  direccion TEXT,
  logo_url VARCHAR(255),
  sitio_web VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
    'libro', 'papeleria', 'escritura', 'manualidades', 
    'oficina', 'regalos', 'didacticos', 'limpieza'
  )),
  precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  codigo_barras VARCHAR(20) UNIQUE,
  descripcion TEXT,
  imagen_url VARCHAR(255),
  proveedor_id INTEGER REFERENCES proveedores(id),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(15),
  email VARCHAR(100),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  empleado_id INTEGER REFERENCES empleados(id) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  tipo_pago VARCHAR(20) CHECK (tipo_pago IN ('efectivo', 'tarjeta', 'transferencia'))
);

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- ========================
-- TRIGGER DE STOCK
-- ========================

CREATE OR REPLACE FUNCTION actualizar_stock() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE productos SET stock = stock - NEW.cantidad WHERE id = NEW.producto_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE productos SET stock = stock + OLD.cantidad WHERE id = OLD.producto_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE productos SET stock = stock + OLD.cantidad - NEW.cantidad WHERE id = NEW.producto_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_actualizar_stock
AFTER INSERT OR UPDATE OR DELETE ON detalle_ventas
FOR EACH ROW EXECUTE FUNCTION actualizar_stock();

-- ========================
-- INSERTS INICIALES
-- ========================

-- Usuario admin (contraseña: admin123)
INSERT INTO usuarios (nombre, rol, password_hash)
VALUES ('admin', 'admin', '$2a$10$pU4jevAw6oikEP8N.nTtoOddydSja1/jMEuG3V0drOxc5EAuCYw4K');

-- Empleado asociado al usuario admin
INSERT INTO empleados (
  nombre_completo, ci, telefono, email, direccion, foto_url,
  fecha_contratacion, puesto, activo, usuario_id
)
VALUES (
  'Admin Principal',
  '12345678',
  '78965432',
  'admin@libreria.com',
  'Av. Principal #123',
  'https://i.ibb.co/KGk0dxM/admin.jpg',
  CURRENT_DATE,
  'administrador',
  TRUE,
  (SELECT id FROM usuarios WHERE nombre = 'admin')
);
