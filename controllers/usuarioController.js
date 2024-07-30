const pool = require("../config/database");
const Usuario = require("../models/usuario");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const usuarioController = {
  // Endpoint para obtener códigos postales según la provincia y localidad seleccionadas
  async obtenerCp(req, res) {
    const { localidadId } = req.params;
    console.log(localidadId);
    if (!localidadId) {
      return res.status(400).json({
        message: "Debe proporcionar el ID de la localidad",
      });
    }

    try {
      const [codigosPostales] = await pool.query(
        `SELECT cp.id, cp.codigo 
       FROM codigo_postal cp 
       INNER JOIN localidad l ON l.codigo_postal_id = cp.id 
       WHERE l.id = ?`,
        [localidadId]
      );
      console.log("Códigos postales:", codigosPostales); // Asegúrate de ver todos los códigos postales aquí
      res.json(codigosPostales);
    } catch (error) {
      console.error("Error al obtener códigos postales:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  },
  // Endpoint para obtener localidades según la provincia seleccionada
  async obtenerLocalidades(req, res) {
    const { provinciaId } = req.params;
    if (!provinciaId) {
      return res.status(400).json({ message: "ID de provincia requerido" });
    }

    try {
      const [localidades] = await pool.query(
        "SELECT id, nombre FROM localidad WHERE provincia_id = ?",
        [provinciaId]
      );
      console.log(localidades);
      res.json(localidades);
    } catch (error) {
      console.error("Error al obtener localidades:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  },
  // Endpoint para obtener provincias según el texto de búsqueda
  async obtenerProvincias(req, res) {
    console.log("ingreso en provincias");
    const { search } = req.query;
    console.log(search);
    if (!search || search.length < 2) {
      return res
        .status(400)
        .json({ message: "Debe proporcionar al menos 2 letras para buscar" });
    }

    try {
      const [provincias] = await pool.query(
        "SELECT id, nombre FROM provincia WHERE nombre LIKE ?",
        [`${search}%`]
      );
      console.log(provincias);
      res.json(provincias);
    } catch (error) {
      console.error("Error al obtener provincias:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  },
  // Método para obtener todas las especialidades
  async obtenerEspecialidades(req, res) {
    console.log("ingreso en especialidades");
    const { profesionId } = req.params;
    console.log(profesionId);
    if (!profesionId) {
      return res.status(400).json({ message: "ID de profesión requerido" });
    }

    try {
      const [especialidades] = await pool.query(
        "SELECT id, nombre FROM especialidad WHERE profesion_id = ?",
        [profesionId]
      );
      console.log(especialidades);
      res.json(especialidades);
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  },
  // Método para obtener la lista de profesiones
  async obtenerProfesiones(req, res) {
    console.log("ingreso en profesiones");
    try {
      const query = "SELECT id, nombre FROM profesion";
      const [rows] = await pool.query(query);
      res.json(rows);
      console.log(rows);
    } catch (error) {
      console.error("Error al obtener profesiones:", error);
      res.status(500).json({ message: "Error al obtener profesiones" });
    }
  },
  // Método para obtener la lista de paises
  async obtenerPaises(req, res) {
    try {
      const query = "SELECT codigo_pais, nombre_pais FROM pais";
      const [rows] = await pool.query(query);

      res.json(rows);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener la lista de países",
      });
    }
  },
  // Método para verificar si existe un usuario en REFEPS
  async verificarREFEPS(req, res) {
    console.log("aqui ingreso", req.body);
    const { tipoDni, documento, nombre, apellido, codigo_pais } = req.body;

    try {
      const query = `
      SELECT idREFEPS 
      FROM refeps 
      WHERE tipo_dni = ? AND documento = ? AND nombre = ? AND apellido = ? AND codigo_pais = ?
    `;
      const [rows] = await pool.query(query, [
        tipoDni,
        documento,
        nombre,
        apellido,
        codigo_pais,
      ]);

      if (rows.length > 0) {
        console.log(rows[0]);
        res.json({ success: true, idREFEPS: rows[0].idREFEPS });
      } else {
        res.json(
          {
            success: false,
            message: "No se encontraron coincidencias en REFEPS",
          },
          console.log("No se encontraron coincidencias en REFEPS")
        );
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al verificar en REFEPS" });
    }
  },
  // Método para buscar un usuario por tipo de DNI y número de documento
  async buscarUsuario(req, res, next) {
    console.log(req.body);
    try {
      const { tipoDni, documento } = req.body;
      console.log(tipoDni, documento);
      if (!tipoDni || !documento) {
        return res.status(400).json({
          message: "Tipo de DNI y número de documento son requeridos",
        });
      }

      const [rows] = await pool.query(
        `SELECT u.id, p.nombre, p.apellido, p.telefono, u.email, u.estado, u.rol,
              CASE
                WHEN u.rol IN ('profesional', 'admin_profesional') THEN pr.caducidad
                ELSE NULL
              END AS caducidad
       FROM usuario u
       JOIN persona p ON u.persona_id = p.id
       LEFT JOIN profesional pr ON pr.persona_id = p.id AND u.rol IN ('profesional', 'admin_profesional')
       WHERE p.tipo_dni_id = ? AND p.documento = ?`,
        [tipoDni, documento]
      );

      if (rows.length === 0) {
        console.log("usuario no encontrado, error 404");
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      console.log(rows[0]);
      res.json(rows[0]);
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },
  // Método para obtener un usuario por su ID
  async getById(req, res, next) {
    try {
      const id = req.params.id;
      const [rows] = await pool.query("SELECT * FROM usuario WHERE id = ?", [
        id,
      ]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json(rows[0]);
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },
  async modificarEstado(req, res, next) {
    try {
      const id = req.params.id;

      // Consulta para actualizar el estado de un usuario en la base de datos
      const query = "UPDATE usuario SET estado = 'Inactivo' WHERE id = ?";
      await pool.query(query, [id]);
      console.log("actualizo estado");
      res.json({ message: "Usuario actualizado a Inactivo exitosamente" });
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },

  // Método para crear un nuevo usuario
  async create(req, res, next) {
    console.log(req.body);
    const connection = await pool.getConnection();

    try {
      const {
        nombre,
        apellido,
        tipoDniId,
        documento,
        fecha_nacimiento,
        sexoId,
        domicilio, // Objeto con datos del domicilio
        telefono,
        email,
        password,
        estado = "Activo",
        rol,
        // Campos adicionales para profesional
        codigo_pais,
        idREFEPS,
        profesion,
        especialidad_id,
        matricula,
        caducidad,
      } = req.body;
      console.log("aqui llegó1");
      // Valido que todos los campos requeridos estén presentes
      if (
        !nombre ||
        !apellido ||
        !tipoDniId ||
        !documento ||
        !email ||
        !password ||
        !rol
      ) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }
      // Validar campos adicionales solo si el rol es profesional o admin_profesional
      if (rol === "profesional" || rol === "admin_profesional") {
        if (
          !codigo_pais ||
          !domicilio ||
          !profesion ||
          !matricula ||
          !caducidad ||
          !idREFEPS
        ) {
          return res.status(400).json({
            message: "Campos adicionales de profesional son obligatorios",
          });
        }
      }
      console.log("aqui llegó2");
      // Cifrar la contraseña
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log("aqui llegó3");
      await connection.beginTransaction(); // Inicio la transacción
      console.log("Se inicio la transacción");

      // Inserto en la tabla domicilio si hay datos
      let domicilioId = null;
      if (domicilio) {
        const domicilioQuery = `
        INSERT INTO domicilio (calle, numero, piso, departamento, localidad_id)
        VALUES (?, ?, ?, ?, ?)
      `;
        const [domicilioResult] = await connection.query(domicilioQuery, [
          domicilio.calle,
          domicilio.numero,
          domicilio.piso,
          domicilio.departamento,
          domicilio.localidadId,
        ]);
        domicilioId = domicilioResult.insertId;
      }
      console.log("Se insertaron los datos del domicilio");
      // Inserto en la tabla persona
      // Verificar si la persona ya existe
      const checkPersonaQuery = `
      SELECT id FROM persona 
      WHERE tipo_dni_id = ? AND documento = ?
    `;
      const [existingPersona] = await connection.query(checkPersonaQuery, [
        tipoDniId,
        documento,
      ]);

      let personaId;

      if (existingPersona.length > 0) {
        // Si la persona ya existe, usar el ID existente
        personaId = existingPersona[0].id;
        console.log("La persona ya existe");
      } else {
        // Insertar en la tabla persona si no existe
        const personaQuery = `
        INSERT INTO persona (nombre, apellido, tipo_dni_id, documento, fecha_nacimiento, sexo_id, domicilio_id, telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
        const [personaResult] = await connection.query(personaQuery, [
          nombre,
          apellido,
          tipoDniId,
          documento,
          fecha_nacimiento || null,
          sexoId || null,
          domicilioId || null,
          telefono || null,
        ]);
        personaId = personaResult.insertId;
        console.log("Se insertaron los datos de la persona");
      }
      // Inserto en la tabla usuario
      const usuarioQuery = `
      INSERT INTO usuario (persona_id, email, password, estado, rol)
      VALUES (?, ?, ?, ?, ?)
    `;
      const [usuarioResult] = await connection.query(usuarioQuery, [
        personaId,
        email,
        hashedPassword,
        estado,
        rol,
      ]);
      const usuarioId = usuarioResult.insertId;
      console.log("Se insertaron los datos del usuario");

      // Si es profesional o admin_profesional, inserto datos adicionales en la tabla profesional
      if (rol === "profesional" || rol === "admin_profesional") {
        const profesionalQuery = `
        INSERT INTO profesional (persona_id, profesion_id, matricula, tipo_dni_id, documento, usuario_id, caducidad, idREFEPS, codigo_pais, domicilio_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
        const [profesionalResult] = await connection.query(profesionalQuery, [
          personaId,
          profesion,
          matricula,
          tipoDniId,
          documento,
          usuarioId,
          caducidad,
          idREFEPS || null,
          codigo_pais || null,
          domicilioId || null, // Agrego el domicilio_id
        ]);
        const profesionalId = profesionalResult.insertId;

        // Inserta datos en la tabla profesional_especialidad
        if (especialidad_id) {
          const especialidadQuery = `
      INSERT INTO profesional_especialidad (profesional_id, especialidad_id)
      VALUES (?, ?)
    `;
          await connection.query(especialidadQuery, [
            profesionalId,
            especialidad_id,
          ]);
        }
      }
      console.log("Se insertaron los datos adicionales");
      await connection.commit(); // Confirmo la transacción
      console.log("Se confirmo la transacción");
      res.json({
        success: true,
        message: "Usuario creado exitosamente",
        usuarioId,
      });
    } catch (error) {
      await connection.rollback(); // Revertir la transacción en caso de error
      console.log("Se revertio la transacción");
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    } finally {
      connection.release(); // Liberar la conexión
    }
  },

  // Método para actualizar un usuario existente
  async update(req, res, next) {
    console.log(req.body);
    const connection = await pool.getConnection(); // Obtengo  conexión pool
    try {
      await connection.beginTransaction(); // Inicio la transacción

      const id = req.params.id;
      const {
        nombre,
        apellido,
        telefono,
        email,
        password,
        estado,
        rol,
        caducidad,
      } = req.body;
      console.log("llego");

      console.log("compara contraseñas");
      // Actualizar los datos en la tabla persona
      const personaQuery = `
      UPDATE persona
      SET nombre = ?, apellido = ?,  telefono = ?
      WHERE id = (SELECT persona_id FROM usuario WHERE id = ?)
    `;
      await connection.query(personaQuery, [nombre, apellido, telefono, id]);
      console.log("actualizo persona");
      // Preparar la consulta de actualización para la tabla usuario
      let usuarioQuery = `
      UPDATE usuario
      SET email = ?, estado = ?, rol = ?
      WHERE id = ?
    `;
      let values = [email, estado, rol, id];
      console.log("actualizo usuario");

      // Verificar que los campos de contraseña coincidan   // Verificar que las contraseñas coincidan si ambas están presentes
      /*    if (contrasena || confirmarContrasena) {
        if (contrasena !== confirmarContrasena) {
          await connection.rollback(); // Deshacer la transacción
          return res
            .status(400)
            .json({ message: "Las contraseñas no coinciden" });
        }
      } */
      // Solo actualiza la contraseña si se proporciona una nueva
      //const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

      // Solo actualizar la contraseña si se proporciona una nueva
      if (password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        usuarioQuery = `
        UPDATE usuario
        SET email = ?, password = ?, estado = ?, rol = ?
        WHERE id = ?
      `;
        values = [email, hashedPassword, estado, rol, id];
      }

      await connection.query(usuarioQuery, values);
      console.log("actualizo contraseña");
      // Si el rol es profesional o admin_profesional, actualizar la tabla profesional
      if (rol === "profesional" || rol === "admin_profesional") {
        // Consulta para actualizar solo el campo caducidad sin modificar otros campos
        const profesionalQuery = `
          UPDATE profesional
          SET caducidad = ?
          WHERE usuario_id = ?
        `;
        await connection.query(profesionalQuery, [caducidad, id]);
      }

      console.log("actualizo profesional");
      await connection.commit(); // Confirmar la transacción
      res.json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
      await connection.rollback(); // Deshacer la transacción en caso de error
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    } finally {
      connection.release(); // Libero la conexión
    }
  },
  // Método para eliminar un usuario
  async delete(req, res, next) {
    try {
      const id = req.params.id;

      // Primero eliminar de la tabla usuario
      await pool.query("DELETE FROM usuario WHERE id = ?", [id]);

      // Luego eliminar de la tabla persona
      await pool.query(
        "DELETE FROM persona WHERE id = (SELECT persona_id FROM usuario WHERE id = ?)",
        [id]
      );

      res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },
};
module.exports = usuarioController;
