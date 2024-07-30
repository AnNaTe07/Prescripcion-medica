const Persona = require("../models/persona");

const Paciente = require("../models/paciente");

const pacienteController = {
  // Método para obtener un paciente por su ID
  /* async getById(req, res, next) {
    try {
      const id = req.params.id;
      const paciente = await Paciente.getById(id);
      res.json(paciente);
    } catch (error) {
      next(error);
    }
  }, */

  // Método para crear un nuevo paciente
  /*   async create(req, res, next) {
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
        email,
        planId,
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

      const pacienteId = await Paciente.create(personaId, email, planId);
      res.json({ message: "Paciente creado exitosamente", pacienteId });
    } catch (error) {
      next(error);
    }
  }, */

  // Método para obtener todos los pacientes
  /*  async getAll(req, res, next) {
    try {
      const pacientes = await Paciente.getAll();
      res.json(pacientes);
    } catch (error) {
      next(error);
    }
  }, */

  //**************Buscar paciente por tipo y documento ************/
  async buscarPacientePorDocumento(req, res) {
    try {
      const { tipoDni, documento } = req.query;
      //console.log(" tipoDni, documento114", tipoDni, documento);
      const paciente = await Paciente.buscarPacienteByTipoDNIYDocumento(
        tipoDni,
        documento
      );
      //console.log("paciente119", paciente);
      if (!paciente) {
        console.log("Paciente no encontrado121");
        return res.status(200).json({ message: "Paciente no encontrado" });
      }
      // console.log("paciente123", paciente);
      res.json(paciente);
    } catch (error) {
      console.error("Error al buscar paciente:", error);
      res.status(500).json({
        error: "Error al buscar paciente en buscarPacientePorDocumento",
      });
    }
  },
  //*********Modificar paciente************************************/
  async modificarPaciente(req, res) {
    const { id } = req.params;
    const pacienteData = req.body;
    console.log("pacienteData137", pacienteData);
    console.log("id", id);

    if (!id || !pacienteData || Object.keys(pacienteData).length === 0) {
      return res
        .status(400)
        .json({ error: "Datos incompletos para modificar el paciente." });
    }
    try {
      await Paciente.updatePaciente(id, pacienteData);
      res.json({ success: true, message: "Paciente modificado con éxito" });
    } catch (error) {
      console.error("Error al modificar paciente:", error);
      res.status(500).json({ error: "Error al modificar paciente" });
    }
  },
  //*********************Registrar paciente************************/
  async registrarPaciente(req, res) {
    try {
      const {
        nombre,
        apellido,
        tipoDni,
        documento,
        fecha_nacimiento,
        sexo,
        email,
        telefono,
        obra_social,
        plan,
      } = req.body;
      const domicilioId = null;

      console.log("Datos recibidos:", req.body);

      const pacienteId = await Paciente.create(
        nombre,
        apellido,
        tipoDni,
        documento,
        fecha_nacimiento,
        sexo,
        domicilioId,
        telefono,
        email,
        plan
      );

      console.log("Paciente registrado con ID:", pacienteId);

      res.status(201).json({ personaId: pacienteId });
    } catch (error) {
      console.error("Error al registrar paciente:", error);
      res.status(500).json({ error: "Error al registrar paciente" });
    }
  },
};

module.exports = pacienteController;
