function crearError(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  return error;
}

export function limpiarEntradas(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const clave in req.body) {
      if (typeof req.body[clave] === 'string') {
        req.body[clave] = req.body[clave].trim();
      }
    }
  }
  next();
}

export function camposObligatorios(campos) {
  return (req, res, next) => {
    for (const campo of campos) {
      const valor = req.body ? req.body[campo] : undefined;
      if (valor === undefined || valor === null || String(valor).trim() === '') {
        return next(crearError('El campo ' + campo + ' es obligatorio'));
      }
    }
    next();
  };
}

export function validarCorreo(campo) {
  return (req, res, next) => {
    const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formato.test(String(req.body[campo]))) {
      return next(crearError('El correo electrónico no es válido'));
    }
    next();
  };
}

export function validarDocumento(campoTipo, campoNumero) {
  return (req, res, next) => {
    const tipos = ['CC', 'TI', 'CE', 'pasaporte'];
    const tipo = req.body[campoTipo];
    const numero = String(req.body[campoNumero]);
    if (!tipos.includes(tipo)) {
      return next(crearError('El tipo de documento no es válido'));
    }
    if (!/^[A-Za-z0-9]{5,15}$/.test(numero)) {
      return next(crearError('El número de documento no es válido'));
    }
    next();
  };
}

export function validarTelefono(campo) {
  return (req, res, next) => {
    if (!/^[0-9]{10}$/.test(String(req.body[campo]))) {
      return next(crearError('El teléfono debe tener 10 números'));
    }
    next();
  };
}

export function validarContrasena(campo) {
  return (req, res, next) => {
    if (String(req.body[campo]).length < 8) {
      return next(crearError('La contraseña debe tener mínimo 8 caracteres'));
    }
    next();
  };
}