import assert from 'node:assert/strict';
import { cleanWhatsAppText } from '../lib/cleanWhatsAppText.js';

// 1. Formato con corchetes
assert.equal(
  cleanWhatsAppText(
    '[10:32, 14/3/2024] Juan Pérez: Hola\n[10:33, 14/3/2024] Ana: A las 3:00 p. m.'
  ),
  'Hola\nA las 3:00 p. m.'
);

// 2. Formato con guion, sistema y líneas vacías sobrantes
assert.equal(
  cleanWhatsAppText(
    [
      '14/3/2024, 10:30 - Los mensajes y las llamadas están cifrados de extremo a extremo.',
      '14/3/2024, 10:31 - María se unió usando el enlace de invitación de este grupo',
      '',
      '14/3/2024, 10:32 - Juan: Bienvenida',
      '',
      '',
      '14/3/2024, 10:33 - María: ¡Gracias!',
    ].join('\n')
  ),
  'Bienvenida\n¡Gracias!'
);

// 3. Mensajes multilínea y espacio estrecho (\u202F) en 12h
assert.equal(
  cleanWhatsAppText(
    '[10:32\u202Fa.\u202Fm., 14/3/2024] Juan: Lista:\n- Pan\n- Leche\n\nAvísame\n\n[10:35\u202Fa.\u202Fm., 14/3/2024] Ana: Listo,\ngracias.'
  ),
  'Lista:\n- Pan\n- Leche\n\nAvísame\nListo,\ngracias.'
);

// 4. Texto sin encabezados reconocibles
const plain = 'Recordatorio: enviar informe.\nVersión 2024 - final.';
assert.equal(cleanWhatsAppText(plain), plain);

console.log('Todas las pruebas pasaron.');
