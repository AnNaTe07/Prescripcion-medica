const pool = require("../config/database.js");

class Persona {
  constructor(
    id,
    nombre,
    apellido,
    tipoDniId,
    documento,
    fechaNacimiento,
    sexoId,
    domicilioId,
    telefono
  ) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.tipoDniId = tipoDniId;
    this.documento = documento;
    this.fechaNacimiento = fechaNacimiento;
    this.sexoId = sexoId;
    this.domicilioId = domicilioId;
    this.telefono = telefono;
  }

  static async getById(id) {
    const query = "SELECT * FROM persona WHERE id = ?";
    const [rows] = await db.execute(query, [id]);
    if (rows.length === 0) {
      throw new Error("Persona no encontrada");
    }
    const personaData = rows[0];
    return new Persona(
      personaData.id,
      personaData.nombre,
      personaData.apellido,
      personaData.tipo_dni_id,
      personaData.documento,
      personaData.fecha_nacimiento,
      personaData.sexo_id,
      personaData.domicilio_id,
      personaData.telefono
    );
  }
  //*************************************Crear persona*********************/
  static async create(
    nombre,
    apellido,
    tipoDniId,
    documento,
    fechaNacimiento,
    sexoId,
    domicilioId,
    telefono
  ) {
    const query = `
      INSERT INTO persona (nombre, apellido, tipo_dni_id, documento, fecha_nacimiento, sexo_id, domicilio_id, telefono)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      nombre,
      apellido,
      tipoDniId,
      documento,
      fechaNacimiento,
      sexoId,
      domicilioId,
      telefono,
    ]);
    return result.insertId;
  }

  async update() {
    // Implementar consulta para actualizar los datos de la persona en la base de datos
    const query = `
      UPDATE persona
      SET nombre = ?, apellido = ?, tipo_dni_id = ?, documento = ?, fecha_nacimiento = ?,
          sexo_id = ?, domicilio_id = ?, telefono = ?
      WHERE id = ?
    `;
    await pool.execute(query, [
      this.nombre,
      this.apellido,
      this.tipoDniId,
      this.documento,
      this.fechaNacimiento,
      this.sexoId,
      this.domicilioId,
      this.telefono,
      this.id,
    ]);
  }

  async delete() {
    // Implementar consulta para eliminar una persona de la base de datos
    const query = "DELETE FROM persona WHERE id = ?";
    await pool.execute(query, [this.id]);
  }
}

module.exports = Persona;
