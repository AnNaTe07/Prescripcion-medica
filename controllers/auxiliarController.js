const auxiliar = require("../models/auxiliar");

//Controlador para obtener dni
exports.getTiposDNI = async (req, res, next) => {
  try {
    const tiposDNI = await auxiliar.getTiposDNI();
    res.json(tiposDNI);
    //console.log("tipos dni", tiposDNI);
  } catch (error) {
    console.error("Error obteniendo tipos de DNI:", error);
    next(error);
  }
};

//controlador para obtener sexos
exports.getSexos = async (req, res, next) => {
  try {
    const sexos = await auxiliar.getSexos();
    res.json(sexos);
  } catch (error) {
    console.error("Error obteniendo sexos:", error);
    next(error);
  }
};
//controlador para obtener obras sociales
exports.getObrasSociales = async (req, res, next) => {
  try {
    const obrasSociales = await auxiliar.getObrasSociales();
    res.json(obrasSociales);
  } catch (error) {
    console.error("Error obteniendo obras sociales:", error);
    next(error);
  }
};
//controlador para obtener planes
exports.getPlanes = async (req, res, next) => {
  try {
    const obraSocialId = req.query.obraSocialId; // Obtengo el parámetro de la solicitud
    const planes = await auxiliar.getPlanes(obraSocialId);
    res.json(planes);
  } catch (error) {
    console.error("Error obteniendo planes:", error);
    next(error);
  }
};
//controlador para obtener diagnosticos
/* exports.getDiagnosticos = async (req, res, next) => {
  try {
    const diagnosticos = await auxiliar.getDiagnosticos();
    res.json(diagnosticos);
  } catch (error) {
    console.error("Error obteniendo diagnósticos:", error);
    next(error);
  }
}; */
// Función para obtener los tipos de prestación disponibles
exports.getTiposPrestacion = async (req, res, next) => {
  try {
    const tiposPrestacion = await auxiliar.getTiposPrestacion();
    //console.log("que hay aqui3", tiposPrestacion);
    res.json(tiposPrestacion);
  } catch (error) {
    console.error(
      "Error en el controlador al obtener tipos de prestación:",
      error
    );
    next(error);
  }
};
