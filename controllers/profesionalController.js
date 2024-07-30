const Profesional = require("../models/profesional");
const pool = require("../config/database");

const profesionalController = {
  // Método para obtener un profesional por su ID
  async getById(req, res, next) {
    try {
      const id = req.params.id;
      const profesional = await Profesional.getById(id);
      res.json(profesional);
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },

  // Método para crear un nuevo profesional
  async create(req, res, next) {
    try {
      const {
        nombre,
        apellido,
        tipoDniId,
        documento,
        fechaNacimiento,
        sexoId,
        domicilioId,
        telefono,
        profesionId,
        matricula,
        idRefeps,
        estadoRefeps,
        fechaCaducidad,
        usuarioId,
      } = req.body;
      const profesionalId = await Profesional.create(
        nombre,
        apellido,
        tipoDniId,
        documento,
        fechaNacimiento,
        sexoId,
        domicilioId,
        telefono,
        profesionId,
        matricula,
        idRefeps,
        estadoRefeps,
        fechaCaducidad,
        usuarioId
      );
      res.json({ message: "Profesional creado exitosamente", profesionalId });
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },

  // Método para actualizar un profesional existente
  async update(req, res, next) {
    try {
      const id = req.params.id;
      const {
        nombre,
        apellido,
        tipoDniId,
        documento,
        fechaNacimiento,
        sexoId,
        domicilioId,
        telefono,
        profesionId,
        matricula,
        idRefeps,
        estadoRefeps,
        fechaCaducidad,
        usuarioId,
      } = req.body;
      const profesional = new Profesional(
        id,
        nombre,
        apellido,
        tipoDniId,
        documento,
        fechaNacimiento,
        sexoId,
        domicilioId,
        telefono,
        profesionId,
        matricula,
        idRefeps,
        estadoRefeps,
        fechaCaducidad,
        usuarioId
      );
      await profesional.update();
      res.json({ message: "Profesional actualizado exitosamente" });
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },

  // Método para eliminar un profesional
  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const profesional = await Profesional.getById(id);
      await profesional.delete();
      res.json({ message: "Profesional eliminado exitosamente" });
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },

  async obtenerDatosProfesional(req, res) {
    const userId = req.session.userId;
    console.log("el id del usuario es: " + userId);
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    try {
      console.log("llego al controlador obtenerDatosProfesional");
      console.log("el id del usuario es: " + userId);

      const query = `
   SELECT 
    p.nombre AS persona_nombre, 
    p.apellido AS persona_apellido, 
    pr.nombre AS profesion_nombre, 
    e.nombre AS especialidad_nombre, 
    pro.matricula, 
    u.email, 
    p.telefono, 
    d.calle, 
    d.numero, 
    d.piso, 
    d.departamento, 
    l.codigo_postal_id,
    cp.codigo AS codigo_postal_nombre, 
    pro.idREFEPS,
    pro.id AS profesional_id 
FROM profesional pro
JOIN persona p ON pro.persona_id = p.id
JOIN profesion pr ON pro.profesion_id = pr.id
LEFT JOIN profesional_especialidad pe ON pro.id = pe.profesional_id
LEFT JOIN especialidad e ON pe.especialidad_id = e.id
JOIN usuario u ON pro.usuario_id = u.id
LEFT JOIN domicilio d ON p.domicilio_id = d.id
LEFT JOIN localidad l ON d.localidad_id = l.id
LEFT JOIN codigo_postal cp ON l.codigo_postal_id = cp.id 
WHERE pro.usuario_id = ?`;

      const [rows] = await pool.execute(query, [userId]);

      if (rows.length > 0) {
        res.json(rows[0]); // Retorna el primer resultado
      } else {
        res
          .status(404)
          .json({ message: "Datos del profesional no encontrados" });
      }
    } catch (err) {
      console.error("Error en la consulta:", err);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  async obtenerDatosBasicos(req, res) {
    try {
      const { userId } = req.body;

      const query = `
      SELECT 
        p.nombre AS persona_nombre,
        p.apellido AS persona_apellido,
        u.rol AS rol
      FROM usuario u
      JOIN persona p ON u.persona_id = p.id
      WHERE u.id = ?;
    `;

      const [rows] = await pool.execute(query, [userId]);

      if (rows.length > 0) {
        // Devuelve los datos en formato JSON
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
      res
        .status(500)
        .json({ message: "Error al obtener los datos del profesional" });
    }
  },
};
module.exports = profesionalController;
