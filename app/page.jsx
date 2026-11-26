'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cleanWhatsAppText } from '../lib/cleanWhatsAppText';
import styles from './page.module.css';

const HEADER_HINT = /^\s*\[?\d{1,4}[./-]\d{1,2}[./-]\d{2,4}|^\s*\[\d{1,2}:\d{2}/;

function countLines(text) {
  return text ? text.split('\n').length : 0;
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Respaldo para contextos sin Clipboard API
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(el);
  if (!ok) throw new Error('copy failed');
}

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [removed, setRemoved] = useState(null);
  const [copyState, setCopyState] = useState('idle'); // idle | copied | error
  const timeoutRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const inputLines = useMemo(() => countLines(inputText), [inputText]);

  const handleClean = useCallback(() => {
    if (!inputText.trim()) return;
    const result = cleanWhatsAppText(inputText);
    const headers = inputText.split('\n').filter((l) => HEADER_HINT.test(l)).length;
    setCleanedText(result);
    setRemoved(result === inputText ? 0 : headers);
    setCopyState('idle');
  }, [inputText]);

  const handleCopy = async () => {
    if (!cleanedText) return;
    try {
      await copyToClipboard(cleanedText);
      setCopyState('copied');
    } catch {
      setCopyState('error');
      outputRef.current?.select();
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopyState('idle'), 2000);
  };

  const handleReset = () => {
    setInputText('');
    setCleanedText('');
    setRemoved(null);
    setCopyState('idle');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleClean();
    }
  };

  let status = '—';
  if (removed === 0) status = 'Sin encabezados reconocibles';
  else if (removed > 0) status = `${removed} ${removed === 1 ? 'encabezado quitado' : 'encabezados quitados'}`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <h1 className={styles.title}>
              limpio<span className={styles.dot}>.</span>
            </h1>
            <p className={styles.subtitle}>
              Quita fechas, horas y nombres de chats copiados de WhatsApp.
            </p>
          </div>
          <p className={styles.meta}>Todo ocurre en tu navegador · nada se envía</p>
        </header>

        <main className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <label htmlFor="whatsapp-input" className={styles.label}>
                01 — Pega el chat
              </label>
              <span className={styles.count}>{inputLines} líneas</span>
            </div>
            <textarea
              id="whatsapp-input"
              className={styles.textarea}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={'[10:32, 14/3/2024] Juan Pérez: ¿Llegas a las 6?\n[10:33, 14/3/2024] Ana: Sí, voy saliendo'}
              spellCheck={false}
              autoComplete="off"
            />
            <div className={`${styles.actions} ${styles.desktopOnly}`}>
              <button type="button" className={styles.primary} onClick={handleClean} disabled={!inputText.trim()}>
                Limpiar texto
              </button>
              <button type="button" className={styles.ghost} onClick={handleReset} disabled={!inputText && !cleanedText}>
                Borrar
              </button>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <label htmlFor="whatsapp-output" className={styles.label}>
                02 — Copia el resultado
              </label>
              <span className={styles.status} aria-live="polite">
                {status}
              </span>
            </div>
            <textarea
              id="whatsapp-output"
              ref={outputRef}
              className={`${styles.textarea} ${styles.output}`}
              value={cleanedText}
              readOnly
              placeholder="Aquí aparece el texto limpio."
            />
            <div className={`${styles.actions} ${styles.desktopOnly}`}>
              <button type="button" className={styles.accent} onClick={handleCopy} disabled={!cleanedText}>
                {copyState === 'copied' ? 'Copiado' : 'Copiar resultado'}
              </button>
            </div>
            {copyState === 'error' && (
              <p className={styles.error} role="alert">
                No se pudo copiar. El texto quedó seleccionado: cópialo a mano.
              </p>
            )}
          </section>
        </main>

        <footer className={styles.footer}>
          <span>
            Formatos: <code>[10:32, 14/3/2024]</code> y <code>14/3/24, 10:32 -</code>
          </span>
          <span className={styles.desktopOnlyInline}>Atajo: Ctrl + Enter limpia</span>
        </footer>
      </div>

      <div className={styles.mobileBar}>
        <button type="button" className={styles.primary} onClick={handleClean} disabled={!inputText.trim()}>
          Limpiar
        </button>
        <button type="button" className={styles.accent} onClick={handleCopy} disabled={!cleanedText}>
          {copyState === 'copied' ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}
