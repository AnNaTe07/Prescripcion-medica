const pool = require("../config/database");

//obtener opciones dni
exports.getTiposDNI = async () => {
  try {
    const [tiposDNI] = await pool.query(
      "SELECT id, nombre AS nombre FROM tipo_dni"
    );
    return tiposDNI;
  } catch (error) {
    console.error("Error buscando tiposDNI:", error);
    throw error;
  }
};

exports.getSexos = async () => {
  try {
    const [sexos] = await pool.query("SELECT id, nombre FROM sexo");
    return sexos;
  } catch (error) {
    console.error("Error buscando sexos:", error);
    throw error;
  }
};

exports.getObrasSociales = async () => {
  try {
    const [obrasSociales] = await pool.query(
      "SELECT id, nombre AS nombre FROM obra_social"
    );
    return obrasSociales;
  } catch (error) {
    console.error("Error buscando obrasSociales:", error);
    throw error;
  }
};

exports.getPlanes = async (obraSocialId) => {
  try {
    let query = "SELECT id, nombre, obra_social_id FROM plan";
    const params = [];
    if (obraSocialId) {
      query += " WHERE obra_social_id = ?";
      params.push(obraSocialId);
    }
    const [planes] = await pool.query(query, params);
    return planes;
  } catch (error) {
    console.error("Error buscando planes:", error);
    throw error;
  }
};
/* exports.getDiagnosticos = async () => {
  try {
    const [diagnosticos] = await pool.query(
      "SELECT id, descripcion FROM diagnostico"
    );
    return diagnosticos;
  } catch (error) {
    console.error("Error buscando diagnósticos:", error);
    throw error;
  }
}; */
exports.getTiposPrestacion = async () => {
  try {
    const [rows] = await pool.execute(
      "SELECT DISTINCT id, nombre FROM tipo_prestacion"
    );
    return rows;
  } catch (error) {
    console.error("Error al obtener tipos de prestación:", error);
    throw new Error("Error interno del servidor");
  }
};
