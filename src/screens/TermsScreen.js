import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";
import { colors, radius, shadows, spacing } from "../constants/theme";

const SECTIONS = [
  {
    roman: "I",
    title: "Disposiciones Generales",
    items: [
      {
        num: "1",
        title: "Objeto",
        content: `El presente instrumento regula:

• El uso del sitio web www.cibox.cl
• La compra de productos.
• Las condiciones logísticas de despacho.
• Las políticas sanitarias.
• El tratamiento de datos personales.
• La relación contractual entre CIBOX y el cliente.

Este documento constituye contrato electrónico y se regulan conforme a la Ley N°19.496.

• Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
• Ley N° 19.628 sobre Protección de la Vida Privada.
• Reglamento Sanitario de los Alimentos (DS N° 977/96 Ministerio de Salud).
• Código de Comercio y Código Civil chileno.
• Normativa del Servicio de Impuestos Internos (SII) sobre documentos tributarios electrónicos.`,
      },
      {
        num: "2",
        title: "Identificación del Proveedor",
        content: `El proveedor responsable de la plataforma y de las ventas efectuadas a través del Sitio es: CIBOX COMERCIALIZADORA SpA, sociedad legalmente constituida en Chile, dedicada a la comercialización digital de productos de supermercado, abarrotes, alimentos, bebidas, artículos de aseo y productos para el hogar.`,
      },
    ],
  },
  {
    roman: "II",
    title: "Modelo de Negocio y Alcance Operacional",
    items: [
      {
        num: "3",
        title: "Modelo",
        content: `CIBOX opera como:

• Supermercado digital.
• Venta directa de productos.
• Programas de ahorro y membresías.
• Comercializador directo o indirecto de productos, cajas temáticas, packs u otro bulto.
• Intermediario entre clientes y proveedores.

CIBOX podrá abastecer productos desde:

• Centros de distribución propios o de terceros.
• Proveedores autorizados.
• Operadores logísticos externos.

CIBOX podrá actuar como:

• Vendedor directo de productos.
• Intermediario comercial cuando corresponda, lo cual será informado en cada caso.`,
      },
      {
        num: "4",
        title: "Registro de Usuario",
        content: `Para realizar compras, el cliente podrá:

• Comprar como invitado.
• Crear una cuenta registrando datos verídicos y actualizados.

El usuario es responsable de la confidencialidad de su clave de acceso y de todas las operaciones realizadas desde su cuenta.`,
      },
      {
        num: "5",
        title: "Proceso de Compra",
        content: `La compra se perfecciona cuando:

• El cliente selecciona los productos.
• Acepta los presentes términos.
• Realiza el pago.
• Recibe confirmación electrónica de la orden.

CIBOX podrá anular pedidos en caso de:

• Error evidente en precios.
• Falta de stock no informada oportunamente.
• Problemas en validación de pago.`,
      },
      {
        num: "6",
        title: "Precios y Medios de Pago",
        content: `Los precios:

• Se expresan en pesos chilenos (CLP).
• Incluyen IVA.
• Pueden variar sin previo aviso.

Medios de pago aceptados:

• Tarjetas de débito y crédito.
• Transferencias electrónicas.
• Otros medios que se informen en el Sitio.

Las transacciones se procesan mediante plataformas de pago certificadas que cumplen con estándares de seguridad PCI-DSS.`,
      },
    ],
  },
  {
    roman: "III",
    title: "Perfeccionamiento del Contrato",
    items: [
      {
        num: "7",
        title: "Proceso de Perfeccionamiento",
        content: `La venta se perfecciona cuando:

• El cliente acepta los términos.
• Se valida el pago.
• CIBOX envía confirmación electrónica.

Hasta ese momento, la orden es una propuesta de compra.

CIBOX podrá rechazar pedidos por:

• Error manifiesto de precio.
• Sospecha de fraude.
• Inconsistencia en medios de pago.
• Falta de stock.
• Riesgo logístico.`,
      },
    ],
  },
  {
    roman: "IV",
    title: "Precios y Errores Evidentes",
    items: [
      {
        num: null,
        title: null,
        content: `En caso de error tipográfico evidente:

• CIBOX podrá dejar sin efecto la orden.
• Se devolverá íntegramente el monto pagado.
• No procederán indemnizaciones adicionales.`,
      },
    ],
  },
  {
    roman: "V",
    title: "Logística, Despacho y Cumplimiento",
    items: [
      {
        num: "8",
        title: "Modalidades de Entrega",
        content: `• Entrega programada.
• Entrega en franjas horarias.
• Retiro en punto designado (si aplica).`,
      },
      {
        num: "9",
        title: "Riesgo y Transferencia",
        content: `El riesgo del producto se transfiere al cliente:

• Al momento de la entrega física.
• O al dejar el pedido en lugar autorizado por el cliente.

Si el cliente solicita dejar productos sin recepción presencial, asumirá el riesgo posterior.`,
      },
      {
        num: "10",
        title: "Cobertura",
        content: `CIBOX realizará despachos dentro de las zonas geográficas informadas en el Sitio.`,
      },
      {
        num: "11",
        title: "Plazos",
        content: `Los plazos de entrega estarán de acuerdo con:

• Los informados al momento de la compra, los que podrán variar de acuerdo a la distribución geográfica de los clientes con relación a los centros de distribución.
• Fluctuaciones de tráfico a razón y consideración de tráfico, evento climático u otra condición o acción que vaya en desmedro de los procesos y plazos de entrega.
• Acciones que afectan al plazo de entrega y que no son de directa o indirecta responsabilidad de CIBOX o de terceros que ésta contrate para entregas.
• Problemas viales o de acceso a rutas.
• Errores en la dirección o en los comentarios que el Cliente pueda indicar o escribir, durante el proceso de registro de dirección y/o entrega.`,
      },
      {
        num: "12",
        title: "Recepción",
        content: `El cliente debe:

• Estar dispuesto a ventanas cronológicas de tiempo para entrega, las cuales van desde las 12hrs, 24hr, 36hr, 72hr, 120hr o más, dependiendo de la distancia a recorrer durante el traslado, como así también el posible combinación de transportes a requerir para hacer efectivo el traslado de los productos.
• Proporcionar dirección correcta.
• Garantizar acceso al lugar de entrega.
• Revisar productos al momento de la recepción.

Si el cliente no se encuentra en el domicilio:

• Se podrá reprogramar la entrega con costo adicional.
• O anular la orden según corresponda.`,
      },
      {
        num: "13",
        title: "Servicios de Despacho y Costos de Envío",
        content: `La plataforma CIBOX pone a disposición de los usuarios distintas alternativas de despacho o entrega de productos mediante empresas de transporte y operadores logísticos externos, quienes prestan dichos servicios de manera independiente y autónoma respecto de CIBOX.

Los valores de despacho informados al momento de realizar la compra corresponden a cotizaciones automáticas generadas directamente por los sistemas tecnológicos de las empresas de transporte, los cuales se encuentran integrados a la plataforma de CIBOX con el único objeto de facilitar la contratación del servicio de entrega por parte del usuario.

Dichas tarifas pueden variar en función de múltiples factores definidos por cada proveedor logístico, tales como:

• Dirección de entrega.
• Distancia o zona geográfica.
• Peso o volumen del pedido.
• Disponibilidad de repartidores.
• Condiciones operativas o de demanda.
• Horario del despacho.
• Otras variables propias del algoritmo de cálculo del proveedor logístico.

En consecuencia, CIBOX no interviene en la determinación, cálculo ni actualización de los costos de envío, ni en los sistemas o algoritmos utilizados por las empresas de transporte para la generación de dichas tarifas.

Por lo anterior, CIBOX no será responsable por errores de cálculo, inconsistencias, variaciones, recotizaciones o diferencias en los valores de despacho determinados por las plataformas de las empresas de delivery, ni por eventuales cargos adicionales asociados al servicio de transporte.

El usuario declara conocer y aceptar que el servicio de despacho constituye un servicio prestado directamente por el operador logístico seleccionado, por lo que cualquier reclamo, solicitud de ajuste, reembolso o consulta relacionada con costos de envío, tiempos de despacho, disponibilidad de repartidores, recargos operativos, cancelaciones o reprogramaciones del servicio de transporte, deberá ser gestionado directamente con la empresa de transporte correspondiente, conforme a sus propios términos y condiciones.

Sin perjuicio de lo anterior, CIBOX podrá, de manera voluntaria y sin que ello implique asumir responsabilidad alguna por el servicio de transporte, colaborar con el usuario en la gestión de la comunicación con el operador logístico cuando ello sea razonablemente posible.`,
      },
      {
        num: "14",
        title: "Limitación de Responsabilidad en Servicios de Transporte y Entrega",
        content: `Los servicios de despacho o entrega de productos ofrecidos a través de la plataforma CIBOX pueden ser prestados por empresas de transporte o delivery externas e independientes, que operan mediante integraciones tecnológicas con la plataforma.

CIBOX no controla ni dirige las operaciones logísticas de dichas empresas, por lo que no tiene injerencia en la gestión operativa del servicio de transporte, incluyendo, entre otros aspectos:

• Disponibilidad de repartidores.
• Rutas de despacho.
• Tiempos de entrega.
• Condiciones de transporte.
• Manejo de paquetes.
• Incidencias operativas durante la entrega.

En consecuencia, CIBOX no será responsable por retrasos, cancelaciones, errores de entrega, pérdidas, daños, o cualquier otro inconveniente que se produzca durante la prestación del servicio de transporte, cuando dicho servicio sea ejecutado por operadores logísticos externos.

Sin perjuicio de lo anterior, CIBOX podrá, cuando resulte razonablemente posible, colaborar con el usuario en la gestión de comunicación o seguimiento con el operador logístico correspondiente, sin que ello implique asumir responsabilidad directa sobre la ejecución del servicio.`,
      },
      {
        num: "15",
        title: "Servicios Prestados por Terceros",
        content: `El usuario reconoce y acepta que ciertos servicios disponibles dentro de la plataforma CIBOX pueden ser proporcionados por proveedores externos o terceros independientes, incluyendo, entre otros:

• Empresas de transporte o delivery.
• Plataformas de procesamiento de pagos.
• Proveedores tecnológicos de cotización logística.
• Sistemas de integración o automatización de servicios.

Dichos proveedores operan bajo sus propios términos, condiciones y políticas de servicio, los cuales son independientes de CIBOX.

En consecuencia, el usuario acepta que cualquier situación relacionada con la prestación de estos servicios por parte de terceros —incluyendo cobros, funcionamiento del servicio, condiciones operativas o eventuales incidencias— podrá estar sujeta a los términos y condiciones establecidos por dichos proveedores.

CIBOX no será responsable por fallas, interrupciones, errores de funcionamiento o decisiones operativas adoptadas por dichos terceros, sin perjuicio de que la plataforma pueda facilitar la comunicación o gestión de consultas cuando ello sea posible.`,
      },
    ],
  },
  {
    roman: "VI",
    title: "Productos Perecibles y Cadena de Frío",
    items: [
      {
        num: null,
        title: null,
        content: `CIBOX cumple con:

• Reglamento Sanitario de los Alimentos (DS 977/96).
• Normativa de cadena de frío.
• Exigencias de almacenamiento, transporte y manipulación.

CIBOX garantiza:

• Transporte en condiciones adecuadas.
• Control de temperatura.
• Manipulación conforme DS 977/96.

El cliente debe revisar inmediatamente:

• Integridad.
• Temperatura.
• Estado visible.

Los productos perecibles:

• No están sujetos a derecho a retracto, conforme al art. 3 bis letra b) de la Ley 19.496.
• Deben conservarse según indicaciones del envase.
• Reclamos por productos perecibles deberán realizarse dentro de 6 horas desde la recepción.`,
      },
    ],
  },
  {
    roman: "VII",
    title: "Derecho a Retracto",
    items: [
      {
        num: null,
        title: null,
        content: `Aplica dentro de 10 días para productos no perecibles. En compras electrónicas, el cliente podrá ejercer derecho a retracto dentro de 10 días desde la recepción.

No aplica para:

• Alimentos frescos.
• Productos abiertos o manipulados.
• Bienes personalizados.
• Productos de higiene personal.`,
      },
    ],
  },
  {
    roman: "VIII",
    title: "Garantía Legal",
    items: [
      {
        num: null,
        title: null,
        content: `En caso de producto defectuoso, el cliente podrá optar por:

• Cambio.
• Reparación.
• Devolución del dinero.

Dentro de los 6 meses siguientes a la recepción, conforme Ley 19.496.`,
      },
    ],
  },
  {
    roman: "IX",
    title: "Sustitución de Productos",
    items: [
      {
        num: null,
        title: null,
        content: `CIBOX podrá sustituir productos por:

• Marca equivalente.
• Calidad similar o superior.
• Igual o mayor gramaje.

En caso de quiebre de stock, CIBOX podrá:

• Contactar al cliente para ofrecer reemplazo equivalente.
• Reembolsar el monto correspondiente.

Si el cliente no acepta, se reembolsará la diferencia.`,
      },
    ],
  },
  {
    roman: "X",
    title: "Responsabilidad y Limitación de Responsabilidad",
    items: [
      {
        num: null,
        title: null,
        content: `CIBOX no será responsable por:

• Pérdidas indirectas.
• Lucro cesante.
• Retrasos por causas externas.
• Eventos de fuerza mayor.
• Eventos climáticos extremos.
• Deterioro posterior a la entrega por mal almacenamiento del cliente.
• Fallas de terceros no atribuibles a CIBOX.

La responsabilidad total máxima estará limitada al valor del pedido.

CIBOX será responsable conforme a la normativa vigente por:

• Incumplimientos contractuales.
• Entrega defectuosa imputable al proveedor.`,
      },
      {
        num: "16",
        title: "Protección de Datos Personales",
        content: `Los datos personales serán tratados conforme a la Ley 19.628.

Finalidades:

• Procesar compras.
• Emitir documentos tributarios.
• Gestión logística.
• Comunicaciones comerciales (previo consentimiento).

El cliente podrá solicitar acceso, rectificación o eliminación, y revocar consentimiento en cualquier momento.`,
      },
    ],
  },
  {
    roman: "XI",
    title: "Protección de Datos",
    items: [
      {
        num: null,
        title: null,
        content: `Los datos podrán utilizarse para:

• Procesamiento de órdenes.
• Facturación electrónica.
• Marketing con consentimiento.
• Análisis comercial.
• Registro comercial.

El cliente podrá ejercer derechos ARCO (Acceso, Rectificación, Cancelación y Oposición).`,
      },
    ],
  },
  {
    roman: "XII",
    title: "Facturación Electrónica y Documentos Tributarios",
    items: [
      {
        num: null,
        title: null,
        content: `CIBOX emitirá documentos tributarios electrónicos conforme a la normativa del SII. El cliente es responsable de proporcionar datos correctos para efectos de facturación.`,
      },
    ],
  },
  {
    roman: "XIII",
    title: "Membresías y Programas de Ahorro",
    items: [
      {
        num: null,
        title: null,
        content: `Los beneficios:

• No son acumulables salvo indicación expresa.
• Pueden modificarse con aviso previo.
• No generan derecho adquirido permanente.

Las condiciones específicas de membresías, incluyendo beneficios, descuentos, vigencia y requisitos, serán informadas separadamente y podrán modificarse con aviso previo.`,
      },
    ],
  },
  {
    roman: "XIV",
    title: "Retiro Sanitario (Recall)",
    items: [
      {
        num: null,
        title: null,
        content: `En caso de alerta sanitaria:

• CIBOX notificará a clientes afectados.
• Coordinará retiro del producto.
• Procederá a reembolso o reemplazo.`,
      },
    ],
  },
  {
    roman: "XV",
    title: "Propiedad Intelectual",
    items: [
      {
        num: null,
        title: null,
        content: `Todo contenido del sitio es propiedad de CIBOX. Queda prohibida su reproducción sin autorización escrita previa.`,
      },
    ],
  },
  {
    roman: "XVI",
    title: "Modificaciones",
    items: [
      {
        num: null,
        title: null,
        content: `CIBOX podrá modificar estos términos. Las nuevas versiones serán publicadas en el Sitio con fecha de actualización.`,
      },
    ],
  },
  {
    roman: "XVII",
    title: "Legislación Aplicable y Jurisdicción",
    items: [
      {
        num: null,
        title: null,
        content: `Estos términos se rigen por la legislación chilena, por lo que cualquier controversia será sometida a los Tribunales ordinarios de justicia de Santiago de Chile, sin perjuicio del derecho del consumidor a recurrir al SERNAC.`,
      },
    ],
  },
  {
    roman: "XVIII",
    title: "Resolución de Controversias",
    items: [
      {
        num: null,
        title: null,
        content: `• Mediación voluntaria ante SERNAC.
• Tribunales ordinarios de Santiago.`,
      },
    ],
  },
  {
    roman: "XIX",
    title: "Fuerza Mayor",
    items: [
      {
        num: null,
        title: null,
        content: `Incluye:

• Huelgas.
• Restricciones sanitarias.
• Desastres naturales.
• Fallas sistémicas de telecomunicaciones.`,
      },
    ],
  },
  {
    roman: "XX",
    title: "Contacto",
    items: [
      {
        num: null,
        title: null,
        content: `Para consultas, reclamos o solicitudes:

📧 contacto@cibox.cl
📞 +56 9 9126 4828
📍 La Concepción 81, Oficina 214, Providencia.`,
      },
    ],
  },
  {
    roman: "XXI",
    title: "Cláusula de Integridad Contractual",
    items: [
      {
        num: null,
        title: null,
        content: `Si una disposición es declarada nula, el resto mantiene plena vigencia.`,
      },
    ],
  },
  {
    roman: "XXII",
    title: "Aceptación Digital",
    items: [
      {
        num: null,
        title: null,
        content: `El cliente declara haber leído y aceptado íntegramente estos términos al marcar la casilla correspondiente antes de pagar.`,
      },
    ],
  },
  {
    roman: "XXIII",
    title: "Intermediación Tecnológica de la Plataforma",
    items: [
      {
        num: null,
        title: null,
        content: `CIBOX opera como una plataforma tecnológica de intermediación digital, cuyo objetivo es facilitar la conexión entre usuarios consumidores, proveedores de productos y prestadores de servicios asociados a la compra, tales como operadores logísticos o empresas de despacho.

En este contexto, CIBOX pone a disposición del usuario herramientas tecnológicas que permiten:

• Visualizar productos ofrecidos en la plataforma.
• Realizar pedidos o compras.
• Seleccionar modalidades de despacho.
• Efectuar pagos a través de medios habilitados.
• Gestionar la coordinación de entrega de los productos adquiridos.

La utilización de la plataforma implica que el usuario reconoce que CIBOX actúa exclusivamente como facilitador tecnológico de la transacción, permitiendo la interacción entre las partes involucradas, sin constituirse necesariamente en proveedor directo de todos los servicios asociados al proceso de compra.

En consecuencia, determinados servicios disponibles en la plataforma, tales como transporte, despacho, procesamiento de pagos u otros servicios complementarios, pueden ser prestados por terceros independientes, quienes operan bajo sus propios términos y condiciones.`,
      },
    ],
  },
];

// ─── Componentes ─────────────────────────────────────────────────────────────

function RomanBadge({ roman }) {
  return (
    <View style={{
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
      marginBottom: 10,
    }}>
      <AppText style={{ fontSize: 11, fontWeight: "900", color: "#fff", letterSpacing: 1 }}>
        {roman}
      </AppText>
    </View>
  );
}

function SectionBlock({ section }) {
  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: 14,
      ...shadows.card,
    }}>
      {/* Encabezado de sección */}
      <RomanBadge roman={section.roman} />
      <AppText style={{
        fontSize: 16,
        fontWeight: "900",
        color: colors.text,
        marginBottom: 16,
        letterSpacing: 0.2,
      }}>
        {section.title}
      </AppText>

      {/* Items dentro de la sección */}
      {section.items.map((item, i) => (
        <View key={i} style={[
          i < section.items.length - 1 && {
            borderBottomWidth: 1,
            borderColor: colors.border,
            paddingBottom: 16,
            marginBottom: 16,
          },
        ]}>
          {/* Número + título del artículo (si existe) */}
          {item.num && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <View style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: `${colors.primary}15`,
                borderWidth: 1,
                borderColor: `${colors.primary}28`,
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <AppText style={{ fontSize: 11, fontWeight: "900", color: colors.primary }}>
                  {item.num}
                </AppText>
              </View>
              <AppText style={{ fontSize: 14, fontWeight: "800", color: colors.text, flex: 1 }}>
                {item.title}
              </AppText>
            </View>
          )}

          <AppText style={{ fontSize: 13, color: colors.muted, lineHeight: 22 }}>
            {item.content}
          </AppText>
        </View>
      ))}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function TermsScreen() {
  return (
    <ScreenContainer maxWidth={800} padded>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── Hero ── */}
        <View style={{
          backgroundColor: `${colors.primary}0E`,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: `${colors.primary}20`,
          padding: spacing.lg,
          marginBottom: spacing.lg,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <View style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: `${colors.primary}18`,
              borderWidth: 1,
              borderColor: `${colors.primary}28`,
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
            }}>
              <Ionicons name="document-text-outline" size={26} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 22, fontWeight: "900", color: colors.text, marginBottom: 2 }}>
                Términos y Condiciones
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.muted }}>
                Condiciones de uso que rigen tu experiencia en nuestro sitio.
              </AppText>
            </View>
          </View>

          {/* Info empresa */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            gap: 6,
          }}>
            <AppText style={{ fontSize: 13, fontWeight: "800", color: colors.text }}>
              CIBOX COMERCIALIZADORA SpA
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.muted }}>RUT: 78.245.061-1</AppText>
            <AppText style={{ fontSize: 12, color: colors.muted }}>
              La Concepción 81, Oficina 214, Providencia, Región Metropolitana, Chile
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.muted }}>📧 contacto@cibox.cl</AppText>
            <AppText style={{ fontSize: 12, color: colors.muted }}>📞 +56 9 9126 4828</AppText>
          </View>

          {/* Fecha */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            alignSelf: "flex-start",
            backgroundColor: `${colors.primary}12`,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}>
            <Ionicons name="calendar-outline" size={13} color={colors.primary} />
            <AppText style={{ fontSize: 12, fontWeight: "700", color: colors.primary }}>
              Última actualización: 20.02.2026
            </AppText>
          </View>
        </View>

        {/* ── Secciones ── */}
        {SECTIONS.map((s, i) => (
          <SectionBlock key={i} section={s} />
        ))}

        {/* ── Footer ── */}
        <View style={{
          borderTopWidth: 1,
          borderColor: colors.border,
          paddingTop: 16,
          marginTop: 6,
          alignItems: "center",
        }}>
          <AppText style={{ fontSize: 11, color: colors.muted, textAlign: "center" }}>
            © 2026 CIBOX COMERCIALIZADORA SpA — Todos los derechos reservados
          </AppText>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}
