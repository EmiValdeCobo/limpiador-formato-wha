// Caracteres invisibles de dirección/formato que WhatsApp inserta al copiar texto
const INVISIBLE_DIRECTION_CHARS = /[\u200E\u200F\u202A-\u202E\uFEFF]/g;

// Espacios especiales (no separables o estrechos) frecuentes antes de "a. m." / "p. m."
const SPECIAL_SPACES = /[\u00A0\u202F]/g;

// Patrones base reutilizables para fecha y hora:
// - Fecha: dd/mm/aaaa, m/d/aa, dd.mm.aaaa o aaaa-mm-dd
const DATE_PATTERN = String.raw`\d{1,4}[./-]\d{1,2}[./-]\d{2,4}`;

// - Hora: 24h o 12h, con segundos opcionales y sufijo opcional (am, pm, a. m., p. m.)
const TIME_PATTERN = String.raw`\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s*m\.?)?`;

// Formato con corchetes (WhatsApp Web / iOS / escritorio).
// Acepta "[hora, fecha] resto" y "[fecha, hora] resto", con coma opcional.
const BRACKET_HEADER_REGEX = new RegExp(
  String.raw`^\[(?:${TIME_PATTERN},?\s+${DATE_PATTERN}|${DATE_PATTERN},?\s+${TIME_PATTERN})\]\s+(.*)$`,
  'i'
);

// Formato con guion (Android / exportaciones).
// Acepta "fecha, hora - resto" y "hora, fecha - resto", con guion normal, en-dash o em-dash.
const HYPHEN_HEADER_REGEX = new RegExp(
  String.raw`^(?:${DATE_PATTERN},?\s+${TIME_PATTERN}|${TIME_PATTERN},?\s+${DATE_PATTERN})\s*[-–—]\s+(.*)$`,
  'i'
);

// Separa el nombre o teléfono del autor (hasta el primer ":") del contenido del mensaje.
// El cuantificador no codicioso (.+?) evita cortar URLs u horas dentro del mensaje.
const AUTHOR_SEPARATOR_REGEX = /^([^:\n]+?):(?:\s(.*))?$/;

// Mensajes automáticos típicos del sistema de WhatsApp (español e inglés).
const SYSTEM_MESSAGE_REGEX = new RegExp(
  [
    'cifrados? de extremo a extremo',
    'end-to-end encrypted',
    'se uni[oó] usando el enlace',
    'joined using this group',
    'cre[oó] el grupo',
    'created group',
    'a[nñ]adi[oó] a\\b',
    'agreg[oó] a\\b',
    'elimin[oó] a\\b',
    'sali[oó] del grupo',
    'cambi[oó] el asunto',
    'cambiaste el asunto',
    'cambi[oó] el [ií]cono',
    'cambi[oó] la descripci[oó]n',
    'c[oó]digo de seguridad',
    'changed the subject',
    'changed this group',
    'security code changed',
    'mensajes temporales',
    'disappearing messages',
  ].join('|'),
  'i'
);

function normalizeForMatching(line) {
  return line
    .replace(INVISIBLE_DIRECTION_CHARS, '')
    .replace(SPECIAL_SPACES, ' ');
}

function extractHeaderRemainder(line) {
  const normalized = normalizeForMatching(line).trimStart();
  const bracketMatch = normalized.match(BRACKET_HEADER_REGEX);
  if (bracketMatch) return bracketMatch[1];

  const hyphenMatch = normalized.match(HYPHEN_HEADER_REGEX);
  if (hyphenMatch) return hyphenMatch[1];

  return null;
}

function finalizeMessage(lines) {
  // Elimina líneas vacías al inicio y al final del mensaje
  let start = 0;
  let end = lines.length - 1;

  while (start <= end && lines[start].trim() === '') start++;
  while (end >= start && lines[end].trim() === '') end--;

  if (start > end) return null;

  // Conserva saltos internos del mensaje, pero colapsa múltiples líneas vacías seguidas en una sola
  const cleaned = [];
  let previousWasEmpty = false;

  for (let i = start; i <= end; i++) {
    const isEmpty = lines[i].trim() === '';
    if (isEmpty) {
      if (!previousWasEmpty) cleaned.push('');
      previousWasEmpty = true;
    } else {
      cleaned.push(lines[i]);
      previousWasEmpty = false;
    }
  }

  return cleaned.join('\n');
}

/**
 * Limpia texto copiado desde WhatsApp eliminando encabezados y avisos del sistema.
 * Si no detecta encabezados reconocibles, devuelve el texto original intacto.
 *
 * @param {string} rawText
 * @returns {string}
 */
export function cleanWhatsAppText(rawText) {
  if (typeof rawText !== 'string' || rawText.length === 0) {
    return '';
  }

  const lines = rawText.replace(/\r\n?/g, '\n').split('\n');
  const messages = [];
  let currentMessageLines = null;
  let hasRecognizableHeader = false;

  const flushCurrentMessage = () => {
    if (!currentMessageLines) return;
    const finalized = finalizeMessage(currentMessageLines);
    if (finalized !== null) {
      messages.push(finalized);
    }
    currentMessageLines = null;
  };

  for (const rawLine of lines) {
    const remainder = extractHeaderRemainder(rawLine);

    if (remainder !== null) {
      hasRecognizableHeader = true;
      flushCurrentMessage();

      const authorMatch = remainder.match(AUTHOR_SEPARATOR_REGEX);

      // Si no hay separador "Autor:", o lo que precede a ":" es un evento del sistema,
      // se trata de un aviso de WhatsApp y se ignora.
      if (!authorMatch || SYSTEM_MESSAGE_REGEX.test(authorMatch[1])) {
        continue;
      }

      const body = authorMatch[2] ?? '';
      currentMessageLines = [body];
      continue;
    }

    const normalizedLine = normalizeForMatching(rawLine).trim();

    // Ignora avisos del sistema copiados sin marca de fecha/hora
    if (normalizedLine !== '' && SYSTEM_MESSAGE_REGEX.test(normalizedLine)) {
      continue;
    }

    if (currentMessageLines !== null) {
      currentMessageLines.push(rawLine.replace(INVISIBLE_DIRECTION_CHARS, ''));
    } else if (normalizedLine !== '') {
      // Conserva texto parcial previo al primer encabezado si no es un aviso del sistema
      currentMessageLines = [rawLine.replace(INVISIBLE_DIRECTION_CHARS, '')];
    }
  }

  if (!hasRecognizableHeader) {
    return rawText;
  }

  flushCurrentMessage();
  return messages.join('\n');
}
