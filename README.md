# Prescripcion-medica

El Ministerio de Salud de la Nación avanzó con la reglamentación del DNU 70/23, a través del Decreto N°345/2024, y desde el 1 de julio la implementación de la receta electrónica será obligatoria en todo el país. Nuestro cliente nos ha contratado para implementar una solución informática que soporte la nueva reglamentación.
Los requerimientos son:
Desarrollar una solución web para que un médico autenticado pueda prescribir tanto medicamentos como
otras prestaciones.
Una prescripción electrónica tiene que constar con la siguiente información:
Nombre, Apellido, documento, profesión, especialidad, domicilio y matrícula del profesional.
Nombre, Apellido, documento, fecha de nacimiento, sexo, obra social y plan del paciente.
Diagnóstico, Fecha de la prescripción y vigencia (opcional)
Medicamentos y/o Prestaciones.
Respecto de los medicamentos deben indicarse por su nombre genérico, concentración, forma farmacéutica y
presentación (cantidad de unidades). Opcionalmente el médico podrá indicar el nombre comercial.
Ej. Fluoxetina 20mg capsulas x14 unidades
La receta deberá tener la información respecto a como se administrará el medicamento:
 (dosis por intervalo de tiempo), por ejemplo: una capsula al día, una capsula cada 8 hs, 2 pastillas
después de cada comida.
 Duración: Por cuanto tiempo se administrará la medicación. Ej 7 días, Hasta que no haya dolor, si es
necesario, etc.
Es importante mencionar que los medicamentos deberán ser obtenidos en base al diccionario nacional de
medicamentos que pronto pondrá a disposición el ministerio de salud. Por el momento se seleccionarán desde
la base local. A tal fin la aplicación deberá proveer una función para el registro de estos.
Registro de Medicamentos: Debe considerar la posibilidad de registrar, modificar, activar y desactivar los
medicamentos. Cada medicamento puede pertenecer a una categoría (Aparato digestivo, Nutriología,
Cardiovascular, etc) como así también una familia (analgésicos, antivirales, antihistamínicos, antieméticos,
etc).
Cada medicamento tendrá registrado las posibles concentraciones, formas farmacéuticas y presentaciones
cuestión de facilitar la prescripción y evitar errores del prescriptor.
Respecto de las prestaciones debe indicarse el nombre de la práctica/procedimiento/examen, lado (opcional),
indicación y justificación.
Ej. Resonancia Magnética de Cerebro.
Respecto de los profesionales si bien la aplicación dispondrá de una gestión propia de los profesionales estos
deberán estar incluidos en el registro de profesionales de la salud (REFEPS) por lo cual es importante que la
aplicación permita integrarse al registro. Por tal motivo es de suma importancia registrar junto con los datos
de los profesionales el ID del registro REFEPS.
El registro de los profesionales será realizado por un administrador y tendrá una caducidad.
Programación Web II – Desarrollador de Software
Nota: Al no contar con permiso para acceder a la API REFEPS la aplicación deberá simular el endpoint para
verificar el profesional.
Algunas reglas de negocio que debe cumplir la aplicación:
 Una prescripción no puede tener ítems repetidos (Ej 2 Tomografías de Cuello o 2 indicaciones de
Ibuprofeno 500mg.
 Debe permitir imprimir la prescripción adecuadamente con todos los datos obligatorios.
 Debe mostrar prescripciones anteriores para facilitar el registro de las prescripciones actuales.
 Debe permitir registrar resultado y/o observación sobre prestaciones de prescripciones anteriormente
registradas.
