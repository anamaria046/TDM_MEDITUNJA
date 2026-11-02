import multer from 'multer';

const recibirArchivo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 12 }
}).single('comprobante');

export function recibirComprobante(req, res, next) {
  recibirArchivo(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        error: 'comprobante_demasiado_grande',
        mensaje: 'El comprobante no puede superar 5 MB.'
      });
      return;
    }

    if (error instanceof multer.MulterError) {
      res.status(400).json({
        error: 'comprobante_invalido',
        mensaje: 'Adjunta un solo comprobante PDF, JPG o PNG.'
      });
      return;
    }

    next(error);
  });
}
