const pool = require("../config/database.js");
const Persona = require("./persona");

class Paciente extends Persona {
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
    planId
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
    this.planId = planId;
  }

  /*   static async getById(id) {
    const query = `
      SELECT p.*, pa.email, pa.plan_id 
      FROM persona p 
      JOIN paciente pa ON p.id = pa.persona_id 
      WHERE pa.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    if (rows.length === 0) {
      throw new Error("Paciente no encontrado");
    }
    const pacienteData = rows[0];
    return new Paciente(
      pacienteData.id,
      pacienteData.nombre,
      pacienteData.apellido,
      pacienteData.tipo_dni_id,
      pacienteData.documento,
      pacienteData.fecha_nacimiento,
      pacienteData.sexo_id,
      pacienteData.domicilio_id,
      pacienteData.telefono,
      pacienteData.email,
      pacienteData.plan_id
    );
  } */

  /*  static async getAll() {
    const query = `
      SELECT p.*, pa.email, pa.plan_id 
      FROM persona p 
      JOIN paciente pa ON p.id = pa.persona_id
    `;
    const [rows] = await pool.execute(query);
    return rows.map(
      (pacienteData) =>
        new Paciente(
          pacienteData.id,
          pacienteData.nombre,
          pacienteData.apellido,
          pacienteData.tipo_dni_id,
          pacienteData.documento,
          pacienteData.fecha_nacimiento,
          pacienteData.sexo_id,
          pacienteData.domicilio_id,
          pacienteData.telefono,
          pacienteData.email,
          pacienteData.plan_id
        )
    );
  } */
  //********************Buscar paciente por tipo dni y documento **********/
  static async buscarPacienteByTipoDNIYDocumento(tipoDni, documento) {
    // console.log(" tipoDni, documento111", tipoDni, documento);
    try {
      const [result] = await pool.query(
        `SELECT
    paciente.id AS paciente_id,
    paciente.email AS paciente_email,
    persona.nombre AS persona_nombre,
    persona.apellido AS persona_apellido,
    persona.documento AS persona_documento,
    tipo_dni.nombre AS tipo_dni_nombre,
    persona.fecha_nacimiento AS persona_fecha_nacimiento,
    sexo.id AS persona_sexo_id,
    sexo.nombre AS persona_sexo_nombre,
    persona.telefono AS persona_telefono,
    plan.id AS plan_id,
    plan.nombre AS plan_nombre,
    obra_social.id AS obra_social_id,
    obra_social.nombre AS obra_social_nombre
FROM 
    persona 
INNER JOIN 
    paciente ON persona.id = paciente.persona_id
INNER JOIN 
    plan ON paciente.plan_id = plan.id
INNER JOIN 
    obra_social ON plan.obra_social_id = obra_social.id
INNER JOIN
    sexo ON persona.sexo_id = sexo.id
INNER JOIN
    tipo_dni ON persona.tipo_dni_id = tipo_dni.id
WHERE 
    persona.tipo_dni_id = ? AND persona.documento = ?`,
        [tipoDni, documento]
      );
      return result[0];
    } catch (error) {
      throw error;
    }
  }
  //**************************Modificar paciente **************************/
  static async updatePaciente(id, data) {
    const { plan_id, sexo, nombre, apellido, email, telefono } = data;

    // Iniciar una transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Actualizar la tabla paciente
      await connection.query(
        `UPDATE paciente SET plan_id = ?, email = ? WHERE id = ?`,
        [plan_id, email, id]
      );

      // Obtener persona_id a partir del id del paciente
      const [personaResult] = await connection.query(
        `SELECT persona_id FROM paciente WHERE id = ?`,
        [id]
      );
      if (personaResult.length === 0) {
        throw new Error("Paciente no encontrado");
      }
      const persona_id = personaResult[0].persona_id;

      // Actualizar la tabla persona si existen datos para actualizar
      const personaUpdates = [];
      if (sexo) personaUpdates.push(`sexo_id = ${sexo}`);
      if (nombre) personaUpdates.push(`nombre = '${nombre}'`);
      if (apellido) personaUpdates.push(`apellido = '${apellido}'`);
      if (telefono) personaUpdates.push(`telefono = '${telefono}'`);

      if (personaUpdates.length > 0) {
        const updatePersonaQuery = `UPDATE persona SET ${personaUpdates.join(
          ", "
        )} WHERE id = ?`;
        await connection.query(updatePersonaQuery, [persona_id]);
      }

      // Confirmar la transacción
      await connection.commit();
      console.log("Paciente actualizado correctamente.");
    } catch (error) {
      // Revertir la transacción en caso de error
      await connection.rollback();
      console.error("Error al actualizar paciente:", error);
      throw new Error("Error al actualizar paciente");
    } finally {
      // Liberar la conexión de la transacción
      connection.release();
    }
  }
  //**************************Registrar paciente ****************************/
  static async create(
    nombre,
    apellido,
    tipoDniId,
    documento,
    fechaNacimiento,
    sexoId,
    domicilioId,
    telefono,
    email,
    planId
  ) {
    const personaId = await Persona.create(
      nombre,
      apellido,
      tipoDniId,
      documento,
      fechaNacimiento,
      sexoId,
      domicilioId,
      telefono
    );

    const query = `
      INSERT INTO paciente (persona_id, email, plan_id)
      VALUES (?, ?, ?)
    `;
    await pool.execute(query, [personaId, email, planId]);

    return personaId;
  }
}

module.exports = Paciente;
