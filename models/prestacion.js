const pool = require("../config/database");

class Prestacion {
  constructor(
    id,
    nombre,
    posicion_id,
    tipo_prestacion_id,
    indicacion_id,
    justificacion_id
  ) {
    this.id = id;
    this.nombre = nombre;
    this.posicion_id = posicion_id;
    this.tipo_prestacion_id = tipo_prestacion_id;
    this.indicacion_id = indicacion_id;
    this.justificacion_id = justificacion_id;
  }

  static async create(
    nombre,
    posicion_id,
    tipo_prestacion_id,
    indicacion_id,
    justificacion_id
  ) {
    const [result] = await pool.execute(
      "INSERT INTO prestacion (nombre, posicion_id,tipo_prestacion_id, indicacion_id, justificacion_id) VALUES (?, ?, ?, ?, ?)",
      [nombre, posicion_id, tipo_prestacion_id, indicacion_id, justificacion_id]
    );
    return new Prestacion(
      result.insertId,
      nombre,
      posicion_id,
      tipo_prestacion_id,
      indicacion_id,
      justificacion_id
    );
  }

  static async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM prestacion WHERE id = ?", [
      id,
    ]);
    if (rows.length > 0) {
      const {
        id,
        nombre,
        posicion_id,
        tipo_prestacion_id,
        indicacion_id,
        justificacion_id,
      } = rows[0];
      return new Prestacion(
        id,
        nombre,
        posicion_id,
        tipo_prestacion_id,
        indicacion_id,
        justificacion_id
      );
    } else {
      return null;
    }
  }

  static async findAll() {
    const [rows] = await pool.execute("SELECT * FROM prestacion");
    return rows.map(
      (row) =>
        new Prestacion(
          row.id,
          row.nombre,
          row.posicion_id,
          row.tipo_prestacion_id,
          row.indicacion_id,
          row.justificacion_id
        )
    );
  }

  static async update(
    id,
    nombre,
    posicion_id,
    tipo_prestacion_id,
    indicacion_id,
    justificacion_id
  ) {
    await pool.execute(
      "UPDATE prestacion SET nombre = ?, posicion_id = ?,tipo_prestacion_id=?, indicacion_id = ?, justificacion_id = ? WHERE id = ?",
      [
        nombre,
        posicion_id,
        tipo_prestacion_id,
        indicacion_id,
        justificacion_id,
        id,
      ]
    );
    return new Prestacion(
      id,
      nombre,
      posicion_id,
      tipo_prestacion_id,
      indicacion_id,
      justificacion_id
    );
  }

  static async delete(id) {
    await pool.execute("DELETE FROM prestacion WHERE id = ?", [id]);
  }
  //**obtengo las opciones relacionadas por nombre de prestación***********/
  static async getOpcionesRelacionadasPorNombre(nombreSeleccionado) {
    console.log("Función getOpcionesRelacionadasPorNombre llamada");
    try {
      console.log("Conexión a la base de datos establecida");

      const [rows] = await pool.execute(
        `
      SELECT 'posicion' AS tipo, p.id, p.nombre
      FROM prestacion pr
      JOIN posicion p ON pr.posicion_id = p.id
      WHERE pr.nombre = ?

      UNION

      SELECT 'indicacion' AS tipo, i.id, i.nombre
      FROM prestacion pr
      JOIN indicacion i ON pr.indicacion_id = i.id
      WHERE pr.nombre = ?

      UNION

      SELECT 'justificacion' AS tipo, j.id, j.nombre
      FROM prestacion pr
      JOIN justificacion j ON pr.justificacion_id = j.id
      WHERE pr.nombre = ?
    `,
        [nombreSeleccionado, nombreSeleccionado, nombreSeleccionado]
      );

      console.log("Datos obtenidos de la base de datos:", rows);
      return rows;
    } catch (error) {
      console.error(
        "Error al obtener opciones relacionadas por nombre de prestación:",
        error
      );
      throw new Error("Error interno del servidor");
    }
  }

  //*******************obtener nombre de prestacion al seleccionar tipo**/
  static async getNombresPrestacionPorNombre(tipo, nombre) {
    try {
      const [rows] = await pool.execute(
        "SELECT nombre FROM prestacion WHERE tipo_prestacion_id = ? AND nombre LIKE ?",
        [tipo, `%${nombre}%`]
      );
      return rows;
    } catch (error) {
      console.error(
        "Error al obtener nombres de prestación por nombre:",
        error
      );
      throw new Error("Error interno del servidor");
    }
  }

  //*******************carga opciones de nombre segun tipo*****/
  // Método para obtener los nombres de prestación según el tipo seleccionado
  static async getNombresPrestacionPorTipo(tipo) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, nombre FROM prestacion WHERE tipo_prestacion_id = ?",
        [tipo]
      );
      //console.log("Datos obtenidos:", rows);
      return rows;
    } catch (error) {
      console.error("Error al obtener nombres de prestación por tipo:", error);
      throw new Error("Error interno del servidor");
    }
  }

  //***********obtengo los tipos de prestación disponibles*******/

  static async getIdPrestacionPorNombre(nombrePrestacion) {
    try {
      const [rows] = await pool.execute(
        "SELECT id FROM prestacion WHERE nombre = ?",
        [nombrePrestacion]
      );

      if (rows.length > 0) {
        return rows[0].id; // Devolver el primer ID encontrado (debería ser único por la clave primaria)
      } else {
        return null; // Devolver null si no se encontró ninguna prestación con ese nombre
      }
    } catch (error) {
      console.error("Error al obtener ID de prestación por nombre:", error);
      throw new Error("Error interno del servidor");
    }
  }
}
module.exports = Prestacion;
