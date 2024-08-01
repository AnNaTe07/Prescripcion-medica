const Prestacion = require("../models/prestacion");

const prestacionController = {
  async getOpcionesRelacionadasPorNombre(req, res) {
    console.log("Función getOpcionesRelacionadasPorNombre llamada.");
    const { nombreSeleccionado } = req.params;
    console.log("Nombre de prestación recibido:", nombreSeleccionado);

    try {
      const opcionesRelacionadas =
        await Prestacion.getOpcionesRelacionadasPorNombre(nombreSeleccionado);
      console.log("Opciones relacionadas obtenidas:", opcionesRelacionadas);

      const posiciones = opcionesRelacionadas.filter(
        (opcion) => opcion.tipo === "posicion"
      );
      //console.log("Posiciones:", posiciones);

      const justificaciones = opcionesRelacionadas.filter(
        (opcion) => opcion.tipo === "justificacion"
      );
      const indicaciones = opcionesRelacionadas.filter(
        (opcion) => opcion.tipo === "indicacion"
      );
      console.log({ posiciones, justificaciones, indicaciones });
      res.json({ posiciones, justificaciones, indicaciones });
    } catch (error) {
      console.error(
        "Error en el controlador al obtener opciones relacionadas por nombre de prestación:",
        error
      );
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
  async getNombresPrestacionPorTipo(req, res) {
    console.log("Función getNombresPrestacionPorTipo llamada.");
    const { tipo } = req.params;
    console.log("Valores de tipo:", tipo);
    try {
      const nombresPrestacion = await Prestacion.getNombresPrestacionPorTipo(
        tipo
      );
      console.log("Nombres de prestación obtenidos:", nombresPrestacion);
      res.json(nombresPrestacion);
    } catch (error) {
      console.error(
        "Error en el controlador al obtener nombres de prestación por tipo:",
        error
      );
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  async getNombresPrestacionPorNombre(req, res) {
    console.log("Función getNombresPrestacionPorNombre llamada.10");
    const { tipo, nombre } = req.query;
    try {
      const nombresPrestacion = await Prestacion.getNombresPrestacionPorNombre(
        tipo,
        nombre
      );
      res.json(nombresPrestacion);
    } catch (error) {
      console.error(
        "Error en el controlador al obtener nombres de prestación por nombre:",
        error
      );
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
  async getIdPrestacionPorNombre(req, res) {
    const { nombrePrestacion } = req.params;

    try {
      const idPrestacion = await Prestacion.getIdPrestacionPorNombre(
        nombrePrestacion
      );
      if (idPrestacion !== null) {
        res.json({ id: idPrestacion });
      } else {
        res.status(404).json({ message: "Prestación no encontrada" });
      }
    } catch (error) {
      console.error("Error al obtener ID de prestación por nombre:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  ///////////////////////////////////////////////////////////////////////////////
  /*  async createPrestacion(req, res) {
    try {
      const { nombre, posicion_id, tipo_prestacion_id, indicacion_id, justificacion_id } = req.body;
      const newPrestacion = await Prestacion.create(nombre, posicion_id, tipo_prestacion_id, indicacion_id, justificacion_id);
      res.status(201).json(newPrestacion);
    } catch (error) {
      res.status(500).json({ message: "Error creating prestacion", error });
    }
  },

  async getPrestacionById(req, res) {
    try {
      const prestacion = await Prestacion.findById(req.params.id);
      if (prestacion) {
        res.json(prestacion);
      } else {
        res.status(404).json({ message: "Prestacion not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching prestacion", error });
    }
  },

  async getAllPrestaciones(req, res) {
    try {
      const prestaciones = await Prestacion.findAll();
      res.json(prestaciones);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prestaciones", error });
    }
  },

  async getIdPrestacionPorNombre(req, res) {
    const { nombrePrestacion } = req.params;

    try {
      const idPrestacion = await Prestacion.getIdPrestacionPorNombre(nombrePrestacion);

      if (idPrestacion !== null) {
        res.json({ id: idPrestacion });
      } else {
        res.status(404).json({ message: "Prestación no encontrada" });
      }
    } catch (error) {
      console.error("Error al obtener ID de prestación por nombre:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  async updatePrestacion(req, res) {
    try {
      const { nombre, posicion_id, tipo_prestacion_id, indicacion_id, justificacion_id } = req.body;
      const updatedPrestacion = await Prestacion.update(req.params.id, nombre, posicion_id, tipo_prestacion_id, indicacion_id, justificacion_id);
      res.json(updatedPrestacion);
    } catch (error) {
      res.status(500).json({ message: "Error updating prestacion", error });
    }
  }, */
};
module.exports = prestacionController;
