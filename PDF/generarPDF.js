const fs = require("fs");
const { PDFDocument, rgb } = require("pdf-lib");
const path = require("path");
const { format } = require("date-fns");

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy");
};

// Función para dibujar una línea horizontal
const drawLine = (page, yPosition, width) => {
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: width - 50, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
};

async function generarPDF(prescripcion) {
  const {
    profesional,
    paciente,
    diagnostico,
    fechaPrescripcion,
    vigencia,
    medicamentos,
    prestaciones,
  } = prescripcion;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  const fechaNacimientoFormateada = formatDate(
    paciente.persona_fecha_nacimiento
  );

  console.log("Fecha de Nacimiento:", paciente.persona_fecha_nacimiento); // Verifica el valor de fecha_nacimiento
  console.log("Fecha de Nacimiento Formateada:", fechaNacimientoFormateada);

  // Datos del Profesional
  page.drawText(`Profesional:`, {
    x: 50,
    y: height - 50,
    size: 14,
    color: rgb(0, 0, 0),
  });
  drawLine(page, height - 60, width); // Línea horizontal
  let yOffset = height - 80;
  page.drawText(
    `${profesional.persona_nombre}  ${profesional.persona_apellido}        ${
      profesional.profesion_nombre || ""
    }  -  ${profesional.especialidad_nombre || ""}        ID REFEPS: ${
      profesional.idREFEPS || ""
    }`,
    { x: 50, y: yOffset, size: 12 }
  );
  yOffset -= 20;
  page.drawText(
    `Domicilio: ${profesional.calle || ""} ${profesional.numero || ""} Piso:${
      profesional.piso || ""
    } Depto.${profesional.departamento || ""} C.P.(${
      profesional.codigo_postal_nombre || ""
    })`,
    { x: 50, y: yOffset, size: 12 }
  );
  yOffset -= 20;
  page.drawText(
    `Teléfono: ${
      profesional.telefono || ""
    }                              Email: ${profesional.email || ""}`,
    {
      x: 50,
      y: yOffset,
      size: 12,
    }
  );

  // Datos del Paciente
  yOffset -= 35; // Espacio antes del siguiente bloque
  page.drawText(`Paciente:`, {
    x: 50,
    y: yOffset,
    size: 14,
    color: rgb(0, 0, 0),
  });
  drawLine(page, yOffset - 10, width); // Línea horizontal
  yOffset -= 30;
  page.drawText(
    `${paciente.persona_nombre} ${
      paciente.persona_apellido
    }  -                ${paciente.tipo_dni_nombre || ""} : ${
      paciente.persona_documento || ""
    }     ${
      paciente.persona_sexo_nombre || ""
    }  -  Fecha Nac: ${fechaNacimientoFormateada}`,
    { x: 50, y: yOffset, size: 12 }
  );
  yOffset -= 20;
  page.drawText(
    `Obra Social: ${
      paciente.obra_social_nombre || ""
    }                      Plan: ${paciente.plan_nombre || ""}`,
    {
      x: 50,
      y: yOffset,
      size: 12,
    }
  );

  // Diagnóstico
  yOffset -= 35; // Espacio antes del siguiente bloque
  page.drawText(`Diagnóstico:`, {
    x: 50,
    y: yOffset,
    size: 14,
    color: rgb(0, 0, 0),
  });
  drawLine(page, yOffset - 10, width); // Línea horizontal

  yOffset -= 20; // Espacio antes del siguiente bloque
  page.drawText(`${diagnostico || ""}`, {
    x: 50,
    y: yOffset,
    size: 12,
  });
  yOffset -= 20;
  page.drawText(
    `Fecha Prescripción: ${
      fechaPrescripcion || ""
    }                                 Vigencia: ${vigencia || ""}`,
    {
      x: 50,
      y: yOffset,
      size: 12,
    }
  );
  // Medicamentos
  yOffset -= 35; // Espacio antes del siguiente bloque
  page.drawText(`Medicamentos:`, {
    x: 50,
    y: yOffset,
    size: 14,
    color: rgb(0, 0, 0),
  });
  drawLine(page, yOffset - 10, width); // Línea horizontal
  yOffset -= 30;
  for (let medicamento of medicamentos) {
    page.drawText(
      `*${medicamento.nombreG || ""}  -  ${medicamento.nombreComercial || ""}`,
      {
        x: 50,
        y: yOffset,
        size: 12,
      }
    );
    yOffset -= 20;
    page.drawText(
      `Administración: ${medicamento.administracion.dosis || ""} ${
        medicamento.administracion.tiempo || ""
      } ${medicamento.administracion.duracion || ""}`,
      { x: 50, y: yOffset, size: 12 }
    );
    yOffset -= 20;
  }

  // Prestaciones
  yOffset -= 35; // Espacio antes del siguiente bloque
  page.drawText(`Prestaciones:`, {
    x: 50,
    y: yOffset,
    size: 14,
    color: rgb(0, 0, 0),
  });
  drawLine(page, yOffset - 10, width); // Línea horizontal
  yOffset -= 30;
  for (let prestacion of prestaciones) {
    page.drawText(`* ${prestacion.nombrePrestacion || ""}`, {
      x: 50,
      y: yOffset,
      size: 12,
    });
    yOffset -= 20;
    page.drawText(`Justificación: ${prestacion.justificacion || ""}`, {
      x: 50,
      y: yOffset,
      size: 12,
    });
    yOffset -= 20;
    page.drawText(`Indicaciones: ${prestacion.indicacion || ""}`, {
      x: 50,
      y: yOffset,
      size: 12,
    });
    yOffset -= 20;
    page.drawText(`Posición: ${prestacion.posicion || ""}`, {
      x: 50,
      y: yOffset,
      size: 12,
    });
    yOffset -= 20;
  }

  // Guardo el PDF en el sistema de archivos
  const pdfBytes = await pdfDoc.save();
  const pdfPath = path.join(__dirname, "../PDF/prescripcion.pdf");
  fs.writeFileSync(pdfPath, pdfBytes);

  return pdfPath;
}

module.exports = { generarPDF };
