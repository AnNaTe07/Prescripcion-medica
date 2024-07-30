const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const Persona = require("./persona"); // Importo la clase Persona

class Usuario extends Persona {
  constructor(
    id,
    nombre,
    apellido,
    tipoDniId,
    documento,
    fechaNacimiento,
    sexoId,
    domicilioId,
    telefono,
    email,
    password,
    estado,
    rol
  ) {
    super(
      id,
      nombre,
      apellido,
      tipoDniId,
      documento,
      fechaNacimiento,
      sexoId,
      domicilioId,
      telefono
    );
    this.email = email;
    this.password = password;
    this.estado = estado;
    this.rol = rol;
  }

  static async getByEmail(email) {
    //consulta para obtener un usuario por su email desde la base de datos
    const query = "SELECT * FROM usuario WHERE email = ?";
    const [rows] = await pool.execute(query, [email]);
    if (rows.length === 0) {
      throw new Error("Usuario no encontrado");
    }
    const userData = rows[0];
    return new Usuario(
      userData.id,
      userData.nombre,
      userData.apellido,
      userData.tipo_dni_id,
      userData.documento,
      userData.fecha_nacimiento,
      userData.sexo_id,
      userData.domicilio_id,
      userData.telefono,
      userData.email,
      userData.password,
      userData.estado,
      userData.rol
    );
  }

  static async create(
    nombre,
    apellido,
    tipoDniId,
    documento,
    fecha_nacimiento,
    sexoId,
    domicilioId,
    telefono,
    email,
    password,
    estado,
    rol
  ) {
    const connection = await pool.getConnection();
    try {
      // Iniciar transacción
      await connection.beginTransaction();

      // Cifrado de contraseña
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inserto en la tabla persona
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
      const personaId = personaResult.insertId;

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

      // Confirmar transacción
      await connection.commit();
      return usuarioId;
    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      throw error;
    } finally {
      // Liberar conexión
      connection.release();
    }
  }

  async update({ email, password, estado, rol }) {
    // Actualizar los datos de la persona primero
    await super.update();

    // Solo cifrar la contraseña si se ha proporcionado una nueva
    let hashedPassword = this.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Consulta para actualizar los datos del usuario en la base de datos
    const query = `
      UPDATE usuario
      SET email = ?, ${password ? "password = ?, " : ""} estado = ?, rol = ?
      WHERE id = ?
    `;
    const params = [email, estado, rol, this.id];
    if (password) {
      params.splice(1, 0, hashedPassword);
    }

    await pool.execute(query, params);
  }
  async delete() {
    //  consulta para eliminar un usuario de la base de datos
    await super.delete(); // Eliminar la persona
    const query = "DELETE FROM usuario WHERE id = ?";
    await pool.execute(query, [this.id]);
  }
}

module.exports = Usuario;
