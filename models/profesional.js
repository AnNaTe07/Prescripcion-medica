const pool = require("../config/database");

const Persona = require("./persona"); // Importar la clase Persona

class Profesional extends Persona {
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
    profesionId,
    profesionNombre,
    especialidadId,
    especialidadNombre,
    matricula,
    idRefeps,
    estadoRefeps,
    fechaCaducidad,
    usuarioId,
    email,
    calle,
    numero,
    piso,
    departamento,
    codigoPostal
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
    this.profesionId = profesionId;
    this.profesionNombre = profesionNombre;
    this.especialidadId = especialidadId;
    this.especialidadNombre = especialidadNombre;
    this.matricula = matricula;
    this.idRefeps = idRefeps;
    this.estadoRefeps = estadoRefeps;
    this.fechaCaducidad = fechaCaducidad;
    this.usuarioId = usuarioId;
    this.email = email;
    this.calle = calle;
    this.numero = numero;
    this.piso = piso;
    this.departamento = departamento;
    this.codigoPostal = codigoPostal;
  }

  static async getById(id) {
    const query = `
      SELECT 
        pro.id,
        p.nombre AS persona_nombre,
        p.apellido AS persona_apellido,
        pr.nombre AS profesion_nombre,
        pe.nombre AS especialidad_nombre,
        pro.matricula,
        pro.idREFEPS,
        pro.caducidad,
        u.email,
        p.telefono,
        d.calle,
        d.numero,
        d.piso,
        d.departamento,
        l.codigo_postal
      FROM profesional pro
      JOIN persona p ON pro.persona_id = p.id
      JOIN profesion pr ON pro.profesion_id = pr.id
      LEFT JOIN profesional_especialidad pe ON pro.id = pe.profesional_id
      JOIN usuario u ON pro.usuario_id = u.id
      LEFT JOIN domicilio d ON p.domicilio_id = d.id
      LEFT JOIN localidad l ON d.localidad_id = l.id
      WHERE pro.id = ?`;

    const [rows] = await pool.execute(query, [id]);
    if (rows.length === 0) {
      throw new Error("Profesional no encontrado");
    }
    const profesionalData = rows[0];
    return new Profesional(
      profesionalData.id,
      profesionalData.persona_nombre,
      profesionalData.persona_apellido,
      profesionalData.tipo_dni_id,
      profesionalData.documento,
      profesionalData.fecha_nacimiento,
      profesionalData.sexo_id,
      profesionalData.domicilio_id,
      profesionalData.telefono,
      profesionalData.profesion_id,
      profesionalData.profesion_nombre,
      profesionalData.especialidad_id,
      profesionalData.especialidad_nombre,
      profesionalData.matricula,
      profesionalData.idREFEPS,
      profesionalData.estado_refeps,
      profesionalData.caducidad,
      profesionalData.usuario_id,
      profesionalData.email,
      profesionalData.calle,
      profesionalData.numero,
      profesionalData.piso,
      profesionalData.departamento,
      profesionalData.codigo_postal
    );
  }

  static async create(
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
  ) {
    // Implementar consulta para crear un nuevo profesional en la base de datos
    const personaId = await super.create(
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
      INSERT INTO profesional (persona_id, profesion_id, matricula, id_refeps, estado_refeps, fecha_caducidad, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      personaId,
      profesionId,
      matricula,
      idRefeps,
      estadoRefeps,
      fechaCaducidad,
      usuarioId,
    ]);
    return result.insertId;
  }

  async update() {
    // Implementar consulta para actualizar los datos de un profesional en la base de datos
    await super.update(); // Actualizar los datos de la persona
    const query = `
      UPDATE profesional
      SET profesion_id = ?, matricula = ?, id_refeps = ?, estado_refeps = ?, fecha_caducidad = ?, usuario_id = ?
      WHERE id = ?
    `;
    await pool.execute(query, [
      this.profesionId,
      this.matricula,
      this.idRefeps,
      this.estadoRefeps,
      this.fechaCaducidad,
      this.usuarioId,
      this.id,
    ]);
  }

  async delete() {
    // Implementar consulta para eliminar un profesional de la base de datos
    await super.delete(); // Eliminar la persona
    const query = "DELETE FROM profesional WHERE id = ?";
    await pool.execute(query, [this.id]);
  }
}

module.exports = Profesional;
