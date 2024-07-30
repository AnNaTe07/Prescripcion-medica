// controllers/personaController.js

const Persona = require("../models/persona");

const personaController = {
  //*********************persona por su ID*******************/
  getById: async (req, res, next) => {
    try {
      const id = req.params.id;
      const persona = await Persona.getById(id);
      res.json(persona);
    } catch (error) {
      next(error); // Pasa el error al siguiente manejador de errores
    }
  },

  //****************crear persona***************************/
  create: async (req, res, next) => {
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
      } = req.body;
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
      res.json({ message: "Persona creada exitosamente", personaId });
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },

  //***********************actualizar persona***************/
  update: async (req, res, next) => {
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
      } = req.body;
      const persona = new Persona(
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
      await persona.update();
      res.json({ message: "Persona actualizada exitosamente" });
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },

  //************************eliminar persona***************/
  delete: async (req, res, next) => {
    try {
      const id = req.params.id;
      const persona = await Persona.getById(id);
      await persona.delete();
      res.json({ message: "Persona eliminada exitosamente" });
    } catch (error) {
      next(error); // Pasar el error al siguiente middleware o manejador de errores
    }
  },
};

module.exports = personaController;
