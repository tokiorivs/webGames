

// Correo de la empresa donde se recibirán las alertas y constancias oficiales de reclamación
const EMAIL_EMPRESA = "cesaroumeres@gmail.com";

// Correo de respaldo opcional en copia oculta (dejar en blanco "" si no se utiliza)
const EMAIL_BACKUP = "";

// Razón social o denominación comercial para constancias oficiales de INDECOPI
const RAZON_SOCIAL = "César Omar Palero Umeres (totemIn) - RUC 10431501321";
const RUC_EMPRESA = "Servicios de Desarrollo de Software";
const PREFIJO_CORRELATIVO = "TOTEM-" + new Date().getFullYear() + "-";

function doPost(e) {
  try {
    if (!e) {
      Logger.log("Aviso: doPost fue invocado manualmente sin datos de formulario.");
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "success",
          message: "doPost está activo y esperando datos del Libro de Reclamaciones."
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
    }

    // Filtro Anti-Spam / Anti-Bot (Honeypot)
    if (data.honeypot || data.rec_website_url_hp) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "OK" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Límite de tasa (Rate Limiting de 60 segundos por correo) para proteger cuota de Gmail
    const rateLimitKey = "rl_totem_" + (data.email ? String(data.email).toLowerCase().trim() : "sin_email");
    const cache = CacheService.getScriptCache();
    if (cache.get(rateLimitKey)) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "error",
          message: "Ya registramos una solicitud reciente con estos datos. Por favor, espere un momento antes de volver a enviar."
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    cache.put(rateLimitKey, "1", 60);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Reclamaciones");
    if (!sheet) {
      sheet = ss.getSheets()[0];
      sheet.setName("Reclamaciones");
    }

    // Encabezados oficiales de INDECOPI
    const headers = [
      "Fecha y Hora",
      "Código Oficial",
      "Tipo de Registro",
      "Consumidor / Razón Social",
      "Tipo Doc",
      "N° Documento",
      "¿Es Menor de Edad?",
      "Nombre Padre/Madre/Apoderado",
      "Tipo Doc Apoderado",
      "N° Doc Apoderado",
      "Teléfono",
      "Correo Electrónico",
      "Sede / Modalidad del Evento",
      "Domicilio del Consumidor",
      "Distrito",
      "Provincia",
      "Departamento",
      "Tipo de Bien",
      "Monto Reclamado (S/)",
      "Descripción del Bien/Servicio",
      "Detalle de los Hechos",
      "Pedido Concreto del Consumidor",
      "Acciones Adoptadas por el Proveedor",
      "Estado de Atención",
      "Plazo Legal Máximo (15 días hábiles)"
    ];

    if (sheet.getLastRow() === 0 || sheet.getLastColumn() < headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
      sheet.setFrozenRows(1);
    }

    // Generar correlativo inmutable oficial
    const nextNum = Math.max(1, sheet.getLastRow());
    const correlativoOficial = PREFIJO_CORRELATIVO + String(nextNum).padStart(4, "0");
    const fechaHora = new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });

    const tipoRegistro = (data.tipoDisconformidad || "Reclamo").toUpperCase();
    const nombre = truncar(data.nombre || "No especificado", 150);
    const tipoDoc = truncar(data.tipoDoc || "DNI", 20);
    const numDoc = truncar(data.numDoc || "No especificado", 20);
    const esMenor = data.esMenor || (data.apoderadoNombre && data.apoderadoNombre !== "No aplica" ? "SÍ" : "NO");
    const apoderadoNombre = truncar(data.apoderadoNombre || "No aplica", 150);
    const apoderadoTipoDoc = truncar(data.apoderadoTipoDoc || (esMenor === "SÍ" ? "DNI" : "No aplica"), 20);
    const apoderadoNumDoc = truncar(data.apoderadoNumDoc || "No aplica", 20);
    const telefono = truncar(data.telefono || "No especificado", 30);
    const email = truncar(data.email || "", 150);
    const sede = truncar(data.sede || data.ciudad || "Evento Presencial", 80);
    const domicilio = truncar(data.domicilio || "No especificado", 250);
    const distrito = truncar(data.distrito || "No especificado", 100);
    const provincia = truncar(data.provincia || "No especificado", 100);
    const departamento = truncar(data.departamento || "No especificado", 100);
    const bienTipo = truncar(data.bienTipo || "Servicio", 50);
    const monto = truncar(data.monto || "No especificado", 30);
    const descripcion = truncar(data.descripcionServicio || "No especificado", 500);
    const detalle = truncar(data.detalle || "No especificado", 3000);
    const pedido = truncar(data.pedido || "No especificado", 1500);

    const filaRegistro = [
      fechaHora,
      correlativoOficial,
      tipoRegistro,
      sanitizeCell(nombre),
      sanitizeCell(tipoDoc),
      sanitizeCell(numDoc),
      sanitizeCell(esMenor),
      sanitizeCell(apoderadoNombre),
      sanitizeCell(apoderadoTipoDoc),
      sanitizeCell(apoderadoNumDoc),
      sanitizeCell(telefono),
      sanitizeCell(email),
      sanitizeCell(sede),
      sanitizeCell(domicilio),
      sanitizeCell(distrito),
      sanitizeCell(provincia),
      sanitizeCell(departamento),
      sanitizeCell(bienTipo),
      sanitizeCell(monto),
      sanitizeCell(descripcion),
      sanitizeCell(detalle),
      sanitizeCell(pedido),
      "", // Acciones adoptadas por el proveedor
      "PENDIENTE DE RESPUESTA",
      "15 días hábiles contados desde el día siguiente de recepción"
    ];

    sheet.appendRow(filaRegistro);

    // Enviar constancia oficial por correo
    if (email && email.indexOf("@") !== -1) {
      enviarCorreoConstancia({
        emailDestino: email,
        correlativo: correlativoOficial,
        fechaHora: fechaHora,
        tipoRegistro: tipoRegistro,
        nombre: nombre,
        tipoDoc: tipoDoc,
        numDoc: numDoc,
        esMenor: esMenor,
        apoderadoNombre: apoderadoNombre,
        apoderadoTipoDoc: apoderadoTipoDoc,
        apoderadoNumDoc: apoderadoNumDoc,
        telefono: telefono,
        domicilio: domicilio,
        distrito: distrito,
        provincia: provincia,
        departamento: departamento,
        sede: sede,
        bienTipo: bienTipo,
        monto: monto,
        descripcion: descripcion,
        detalle: detalle,
        pedido: pedido
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        correlativo: correlativoOficial,
        fecha: fechaHora,
        message: "Reclamación registrada, PDF generado y constancia enviada exitosamente"
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error en doPost: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: "No se pudo registrar la reclamación en este momento. Por favor, intente en unos minutos."
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Reclamaciones");
    if (!sheet) {
      sheet = ss.getSheets()[0];
      sheet.setName("Reclamaciones");
    }
    const lastRow = sheet.getLastRow();
    const nextNum = Math.max(1, lastRow === 0 ? 1 : lastRow);
    const correlativo = PREFIJO_CORRELATIVO + String(nextNum).padStart(4, "0");

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        correlativo: correlativo,
        año: new Date().getFullYear()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error en doGet: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Error al generar correlativo" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function enviarCorreoConstancia(datos) {
  const tipoLabel = datos.tipoRegistro === "QUEJA" ? "Queja" : "Reclamación";
  const asunto = `Hoja de ${tipoLabel} N° ${datos.correlativo} - totemIn`;

  const sNombre = escapeHtml(datos.nombre);
  const sTipoDoc = escapeHtml(datos.tipoDoc);
  const sNumDoc = escapeHtml(datos.numDoc);
  const esMenorBool = datos.esMenor === "SÍ" || (datos.apoderadoNombre && datos.apoderadoNombre !== "No aplica");
  const sApoderadoNombre = escapeHtml(datos.apoderadoNombre || "");
  const sApoderadoTipoDoc = escapeHtml(datos.apoderadoTipoDoc || "DNI");
  const sApoderadoNumDoc = escapeHtml(datos.apoderadoNumDoc || "");
  const mostrarApoderado = esMenorBool && sApoderadoNombre && sApoderadoNombre !== "No aplica";
  const textoApoderado = mostrarApoderado ? `${sApoderadoNombre} (${sApoderadoTipoDoc}: ${sApoderadoNumDoc})` : "";
  const sTelefono = escapeHtml(datos.telefono);
  const sDomicilio = escapeHtml(datos.domicilio);
  const sDistrito = escapeHtml(datos.distrito);
  const sProvincia = escapeHtml(datos.provincia);
  const sDepartamento = escapeHtml(datos.departamento);
  const sSede = escapeHtml(datos.sede);
  const sBienTipo = escapeHtml(datos.bienTipo);
  const sMonto = escapeHtml(datos.monto);
  const sDescripcion = escapeHtml(datos.descripcion);
  const sTipoRegistro = escapeHtml(datos.tipoRegistro);
  const sCorrelativo = escapeHtml(datos.correlativo);
  const sFechaHora = escapeHtml(datos.fechaHora);
  const sDetalleHtml = escapeHtml(datos.detalle).replace(/\n/g, '<br>');
  const sPedidoHtml = escapeHtml(datos.pedido).replace(/\n/g, '<br>');

  const plainText = `LIBRO DE RECLAMACIONES VIRTUAL - totemIn
${RAZON_SOCIAL}

Estimado(a) ${datos.nombre}:
Confirmamos la recepción de su ${tipoLabel} a través de nuestro Libro de Reclamaciones Virtual.

- Código Oficial: ${datos.correlativo}
- Fecha y hora: ${datos.fechaHora}
- Tipo: ${datos.tipoRegistro}
- Documento: ${datos.tipoDoc} ${datos.numDoc}
${mostrarApoderado ? `- Apoderado: ${textoApoderado}\n` : ''}- Teléfono: ${datos.telefono}
- Domicilio: ${datos.domicilio} (${datos.distrito}, ${datos.provincia}, ${datos.departamento})
- Servicio: ${datos.bienTipo} - ${datos.descripcion}
- Monto Reclamado: S/ ${datos.monto}

DETALLE DE LOS HECHOS:
${datos.detalle}

PEDIDO CONCRETO:
${datos.pedido}

Conforme a la Ley N° 29571 y normativa de INDECOPI, la empresa dará respuesta formal en un plazo no mayor a quince (15) días hábiles al correo electrónico consignado.

Atentamente,
${RAZON_SOCIAL}
Contacto: ${EMAIL_EMPRESA}`;

  const htmlBody = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 680px; margin: 0 auto; border: 1px solid #334155; border-radius: 8px; overflow: hidden; background: #ffffff;">
    <div style="background-color: #0b1120; padding: 22px 26px; color: #ffffff; text-align: center; border-bottom: 3px solid #25D366;">
      <h2 style="margin: 0 0 6px; font-size: 20px; letter-spacing: 0.5px; color: #25D366;">totemIn</h2>
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">${RAZON_SOCIAL}</p>
      <div style="margin-top: 10px; display: inline-block; background: #1e293b; border: 1px solid #25D366; border-radius: 4px; padding: 4px 12px; font-size: 12px; font-weight: bold; color: #ffffff;">
        LIBRO DE RECLAMACIONES VIRTUAL (D.S. N° 011-2011-PCM / D.S. N° 101-2022-PCM)
      </div>
    </div>

    <div style="padding: 26px;">
      <p style="font-size: 15px; color: #1E293B; margin-top: 0;">
        Estimado(a) <strong>${sNombre}</strong>:
      </p>
      <p style="font-size: 14px; color: #475569; line-height: 1.5;">
        Confirmamos la recepción de su <strong>${tipoLabel}</strong> a través de nuestra plataforma virtual. De conformidad con el Código de Protección y Defensa del Consumidor (Ley N° 29571) de INDECOPI, le remitimos la presente constancia formal con su Hoja de Reclamación en formato PDF adjunto.
      </p>

      <div style="background: #f0fdf4; border-left: 4px solid #25D366; padding: 14px 18px; border-radius: 4px; margin: 18px 0;">
        <span style="font-size: 13px; color: #166534; text-transform: uppercase; font-weight: bold;">Hoja de Reclamación Oficial:</span><br>
        <span style="font-size: 20px; font-weight: bold; color: #0b1120; letter-spacing: 1px;">${sCorrelativo}</span><br>
        <span style="font-size: 12px; color: #475569;">Fecha y hora de registro: ${sFechaHora}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155; margin: 16px 0;">
        <tr style="background: #F8FAFC;">
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold; width: 35%;">Tipo de Registro:</td>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0;">${sTipoRegistro}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Documento de Identidad:</td>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0;">${sTipoDoc} ${sNumDoc}</td>
        </tr>
        ${mostrarApoderado ? `
        <tr style="background: #F8FAFC;">
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Padre / Madre / Apoderado:</td>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0;">${textoApoderado}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Teléfono / Celular:</td>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0;">${sTelefono}</td>
        </tr>
        <tr style="background: #F8FAFC;">
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Domicilio del Consumidor:</td>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0;">${sDomicilio}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Ubicación / Modalidad:</td>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0;">${sDistrito}, ${sProvincia}, ${sDepartamento} (${sSede})</td>
        </tr>
        <tr style="background: #F8FAFC;">
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0; font-weight: bold;">Bien o Servicio Reclamado:</td>
          <td style="padding: 8px 12px; border: 1px solid #E2E8F0;">${sBienTipo} - ${sDescripcion} (Monto: S/ ${sMonto})</td>
        </tr>
      </table>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 12px 14px; margin-bottom: 14px;">
        <strong style="color: #0b1120; font-size: 13px;">Detalle de los Hechos:</strong>
        <p style="margin: 6px 0 0; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${sDetalleHtml}</p>
      </div>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 12px 14px; margin-bottom: 14px;">
        <strong style="color: #0b1120; font-size: 13px;">Pedido Concreto:</strong>
        <p style="margin: 6px 0 0; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${sPedidoHtml}</p>
      </div>

      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #92400E; line-height: 1.5;">
        <strong>INFORMACIÓN LEGAL (D.S. N° 011-2011-PCM y D.S. N° 101-2022-PCM):</strong><br>
        • <strong>RECLAMO:</strong> Disconformidad relacionada a los productos o servicios adquiridos.<br>
        • <strong>QUEJA:</strong> Disconformidad no relacionada a los productos o servicios; o malestar respecto a la atención al público.<br>
        • La formulación del reclamo no impide acudir a otras vías de controversia ni es condición previa para interponer una denuncia ante el INDECOPI.<br>
        • Plazo de respuesta: Máximo e improrrogable de <strong>quince (15) días hábiles</strong> mediante notificación formal al correo electrónico consignado.
      </div>
    </div>

    <div style="background: #F1F5F9; padding: 14px; text-align: center; font-size: 11.5px; color: #64748B; border-top: 1px solid #E2E8F0;">
      © ${new Date().getFullYear()} ${RAZON_SOCIAL} | Dinámicas Interactivas para Tótems en Eventos Perú<br>
      Mensaje emitido automáticamente por el sistema del Libro de Reclamaciones Virtual.
    </div>
  </div>
  `;

  // Documento PDF oficial A4 adjunto
  const pdfHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Hoja de Reclamación N° ${sCorrelativo}</title>
    <style>
      body { font-family: Helvetica, Arial, sans-serif; font-size: 10px; color: #1E293B; line-height: 1.35; margin: 15px; }
      .header-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
      .empresa-title { font-size: 14px; font-weight: bold; color: #0f172a; }
      .empresa-sub { font-size: 9px; color: #475569; margin-top: 2px; }
      .correlativo-box { background-color: #0f172a; color: #FFFFFF; padding: 8px 12px; border-radius: 4px; text-align: right; }
      .correlativo-num { font-size: 13px; font-weight: bold; color: #25D366; letter-spacing: 0.5px; }
      .section-header { background-color: #0f172a; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 4px 8px; margin-top: 8px; text-transform: uppercase; }
      table.data-table { width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 4px; }
      table.data-table td { padding: 4px 6px; border: 1px solid #CBD5E1; vertical-align: top; }
      table.data-table td.label { font-weight: bold; background-color: #F8FAFC; width: 28%; color: #334155; }
      .text-box { border: 1px solid #CBD5E1; border-top: none; padding: 6px 8px; font-size: 9.5px; color: #1E293B; background-color: #FFFFFF; min-height: 35px; }
      .legal-note { background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 4px; padding: 6px 8px; font-size: 8px; color: #92400E; margin-top: 8px; }
    </style>
  </head>
  <body>
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <div class="empresa-title">totemIn</div>
          <div class="empresa-sub">${RAZON_SOCIAL}</div>
          <div class="empresa-sub">Desarrollo e Implementación de Dinámicas Interactivas para Tótems y Stands | Arequipa, Perú</div>
        </td>
        <td style="text-align: right; vertical-align: top; width: 45%;">
          <div class="correlativo-box">
            <div style="font-size: 8px; text-transform: uppercase; color: #CBD5E1;">LIBRO DE RECLAMACIONES VIRTUAL</div>
            <div class="correlativo-num">HOJA N° ${sCorrelativo}</div>
            <div style="font-size: 8px; color: #CBD5E1;">Fecha y Hora: ${sFechaHora}</div>
          </div>
        </td>
      </tr>
    </table>

    <div class="section-header">1. Identificación del Consumidor Reclamante</div>
    <table class="data-table">
      <tr>
        <td class="label">Nombres / Razón Social:</td>
        <td><strong>${sNombre}</strong></td>
      </tr>
      <tr>
        <td class="label">Documento de Identidad:</td>
        <td>${sTipoDoc} ${sNumDoc}</td>
      </tr>
      ${mostrarApoderado ? `
      <tr>
        <td class="label">Padre / Madre / Apoderado:</td>
        <td>${textoApoderado}</td>
      </tr>
      ` : ''}
      <tr>
        <td class="label">Teléfono / WhatsApp:</td>
        <td>${sTelefono}</td>
      </tr>
      <tr>
        <td class="label">Correo Electrónico:</td>
        <td>${escapeHtml(datos.emailDestino)}</td>
      </tr>
      <tr>
        <td class="label">Domicilio:</td>
        <td>${sDomicilio} - ${sDistrito}, ${sProvincia}, ${sDepartamento}</td>
      </tr>
      <tr>
        <td class="label">Sede / Modalidad:</td>
        <td>${sSede}</td>
      </tr>
    </table>

    <div class="section-header">2. Identificación del Bien o Servicio Contratado</div>
    <table class="data-table">
      <tr>
        <td class="label">Tipo de Contratación:</td>
        <td>${sBienTipo}</td>
      </tr>
      <tr>
        <td class="label">Monto Reclamado:</td>
        <td>S/ ${sMonto}</td>
      </tr>
      <tr>
        <td class="label">Descripción del Servicio:</td>
        <td>${sDescripcion}</td>
      </tr>
    </table>

    <div class="section-header">3. Detalle de la Reclamación (${sTipoRegistro})</div>
    <div class="text-box">${sDetalleHtml}</div>

    <div class="section-header">4. Pedido Concreto del Consumidor</div>
    <div class="text-box">${sPedidoHtml}</div>

    <div class="section-header">5. Observaciones y Acciones Adoptadas por el Proveedor</div>
    <div class="text-box" style="color: #64748B; font-style: italic;">
      [ Espacio reservado para el registro de la propuesta de solución o acuerdos adoptados por totemIn conforme al D.S. N° 101-2022-PCM ]
    </div>

    <div class="legal-note">
      <strong>INFORMACIÓN LEGAL INDECOPI:</strong> Respuesta en plazo máximo de 15 días hábiles conforme a Ley N° 29571.
    </div>
  </body>
  </html>
  `;

  let pdfAdjunto = null;
  try {
    const blobHtml = Utilities.newBlob(pdfHtml, "text/html", "Hoja-Reclamacion-" + sCorrelativo + ".html");
    pdfAdjunto = blobHtml.getAs("application/pdf").setName("Hoja-Reclamacion-" + sCorrelativo + ".pdf");
  } catch (errPdf) {
    Logger.log("Aviso: No se pudo compilar PDF nativo: " + errPdf.toString());
  }

  const opcionesCorreo = {
    name: "totemIn - Libro de Reclamaciones",
    htmlBody: htmlBody,
    replyTo: EMAIL_EMPRESA
  };

  if (pdfAdjunto) {
    opcionesCorreo.attachments = [pdfAdjunto];
  }

  // Enviar constancia al consumidor
  try {
    MailApp.sendEmail(datos.emailDestino, asunto, plainText, opcionesCorreo);
  } catch (eMail) {
    Logger.log("Error al enviar al reclamante: " + eMail.toString());
  }

  // Notificar al correo de la empresa
  if (EMAIL_EMPRESA && EMAIL_EMPRESA.indexOf("@") !== -1) {
    try {
      const opcionesEmpresa = {
        name: "Alerta Libro de Reclamaciones",
        htmlBody: htmlBody,
        replyTo: datos.emailDestino
      };
      if (pdfAdjunto) opcionesEmpresa.attachments = [pdfAdjunto];
      if (EMAIL_BACKUP && EMAIL_BACKUP.indexOf("@") !== -1) opcionesEmpresa.bcc = EMAIL_BACKUP;

      MailApp.sendEmail(EMAIL_EMPRESA, `[NUEVA ${datos.tipoRegistro}] ${datos.correlativo} - ${datos.nombre}`, plainText, opcionesEmpresa);
    } catch (eEmpresa) {
      Logger.log("Error al notificar a la empresa: " + eEmpresa.toString());
    }
  }
}

function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (/^[=+\-@]/.test(str)) return "'" + str;
  return str;
}

function truncar(val, maxLen) {
  if (!val) return "";
  const str = String(val).trim();
  return str.length > maxLen ? str.substring(0, maxLen) : str;
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
