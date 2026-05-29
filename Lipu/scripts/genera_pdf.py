#!/usr/bin/env python3
"""
LIPU - Genera schede PDF ispezioni alberi
Legge i file JSON in Lipu/schede_pdf/ e genera il PDF corrispondente se mancante.
Font DejaVu per supporto completo caratteri italiani (à, è, é, ì, ò, ù).
"""
import glob
import json
import os
import re
import sys

from fpdf import FPDF

PDF_DIR  = 'Lipu/schede_pdf'
FOTO_DIR = 'Lipu/foto'

# Font DejaVu (installati con fonts-dejavu-core su Ubuntu)
FONT_DIR    = '/usr/share/fonts/truetype/dejavu'
FONT_R      = os.path.join(FONT_DIR, 'DejaVuSans.ttf')
FONT_B      = os.path.join(FONT_DIR, 'DejaVuSans-Bold.ttf')
FONT_I      = os.path.join(FONT_DIR, 'DejaVuSans-Oblique.ttf')
FONT_FAMILY = 'DejaVu'

GREEN   = (45, 106, 79)
WHITE   = (255, 255, 255)
GRAY_BG = (242, 242, 238)
GRAY_BD = (200, 200, 190)
DARK    = (26, 26, 24)
MUTED   = (122, 122, 114)
RED     = (193, 18, 31)
ORANGE  = (231, 111, 0)


def id_safe(id_albero: str) -> str:
    return re.sub(r'\s+', '_', id_albero.strip())


def ts_to_fname(ts: str) -> str:
    """ISO timestamp → nome file: 2026-05-29_21-29-34"""
    ts = str(ts).strip()
    return ts.replace(':', '-').replace('.', '-').replace('T', '_')[:19]


def find_foto(id_s: str, ts_f: str) -> list:
    folder = os.path.join(FOTO_DIR, f'{id_s}_{ts_f}')
    paths = []
    for i in range(1, 4):
        p = os.path.join(folder, f'foto_{i}.jpg')
        paths.append(p if os.path.exists(p) else None)
    return paths


def build_pdf(row: dict) -> bytes:
    pdf = FPDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_margins(15, 15, 15)

    # Registra font Unicode
    pdf.add_font(FONT_FAMILY, style='',  fname=FONT_R)
    pdf.add_font(FONT_FAMILY, style='B', fname=FONT_B)
    pdf.add_font(FONT_FAMILY, style='I', fname=FONT_I)

    W = pdf.epw

    # ── Header ──────────────────────────────────────────────
    pdf.set_fill_color(*GREEN)
    pdf.set_text_color(*WHITE)
    pdf.set_font(FONT_FAMILY, 'B', 13)
    pdf.cell(W, 9, 'LIPU · PROTOCOLLO TUTELA FAUNISTICA',
             fill=True, align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font(FONT_FAMILY, 'I', 9)
    pdf.cell(W, 6, 'SCHEDA DI ISPEZIONE ALBERI PRIMA DEL TAGLIO',
             fill=True, align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(4)

    def section(title):
        pdf.set_fill_color(*GRAY_BG)
        pdf.set_draw_color(*GRAY_BD)
        pdf.set_text_color(*GREEN)
        pdf.set_font(FONT_FAMILY, 'B', 10)
        pdf.cell(W, 7, title, fill=True, border=1,
                 new_x='LMARGIN', new_y='NEXT')
        pdf.ln(1)

    def field_pair(lbl1, val1, lbl2=None, val2=None):
        half = W / 2 - 1
        # etichette
        pdf.set_font(FONT_FAMILY, '', 7)
        pdf.set_text_color(*MUTED)
        if lbl2:
            pdf.cell(half, 4, lbl1)
            pdf.cell(2, 4, '')
            pdf.cell(half, 4, lbl2, new_x='LMARGIN', new_y='NEXT')
        else:
            pdf.cell(W, 4, lbl1, new_x='LMARGIN', new_y='NEXT')
        # valori
        pdf.set_font(FONT_FAMILY, 'B', 10)
        pdf.set_text_color(*DARK)
        if lbl2:
            pdf.cell(half, 6, str(val1 or '-'))
            pdf.cell(2, 6, '')
            pdf.cell(half, 6, str(val2 or '-'), new_x='LMARGIN', new_y='NEXT')
        else:
            pdf.cell(W, 6, str(val1 or '-'), new_x='LMARGIN', new_y='NEXT')
        pdf.ln(2)

    # ── 1 · Anagrafica ──────────────────────────────────────
    ts = row.get('timestamp', '')
    data_str = ts.split('T')[0] if 'T' in ts else ts[:10]
    section(' 1 · ANAGRAFICA DELLA PIANTA')
    field_pair('ID Albero', row.get('id_albero', ''),
               'Data ispezione', data_str)
    field_pair('Specie', row.get('specie', ''),
               'Ora controllo', row.get('ora_controllo', ''))
    field_pair('Ubicazione', row.get('via', ''))
    field_pair('Operatore', row.get('nome_operatore', ''),
               'Ruolo', row.get('ruolo_operatore', ''))

    # ── 2 · Dichiarazione ───────────────────────────────────
    section(' 2 · DICHIARAZIONE OPERATORE')
    checks = [
        ('Nidi strutturati, uova o piccoli (pulli) visibili nella chioma o cavità',
         row.get('nido_visibile', '-')),
        ('Richiami o pigolii percepibili provenienti dalla chioma o cavità',
         row.get('richiami', '-')),
        ('Andirivieni continuo di adulti con cibo nel becco verso la chioma',
         row.get('andirivieni', '-')),
    ]
    for label, val in checks:
        pdf.set_font(FONT_FAMILY, '', 9)
        pdf.set_text_color(*DARK)
        pdf.cell(W - 18, 6, label)
        c = ORANGE if val == 'Si' else GREEN
        pdf.set_text_color(*c)
        pdf.set_font(FONT_FAMILY, 'B', 9)
        pdf.cell(18, 6, str(val or '-'), align='R',
                 new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)

    # ── 3 · Esito ────────────────────────────────────────────
    section(" 3 · ESITO DELL'ESAME")
    esito = row.get('esito', '-')
    if esito == 'SOSPENDERE':
        c = RED
    elif esito == 'NEGATIVO':
        c = GREEN
    else:
        c = ORANGE
    pdf.set_text_color(*c)
    pdf.set_font(FONT_FAMILY, 'B', 13)
    pdf.cell(W, 9, esito or '-', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)

    # ── Note ─────────────────────────────────────────────────
    section(' NOTE AGGIUNTIVE')
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.set_text_color(*DARK)
    pdf.multi_cell(W, 5, row.get('note', '') or 'Nessuna nota aggiuntiva.',
                   new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)

    # ── Firme ────────────────────────────────────────────────
    section(' FIRME DI CONVALIDA')
    field_pair('Firma Operatore', row.get('firma_operatore', ''),
               'Firma Capocantiere', row.get('firma_capocantiere', ''))

    # ── Foto ─────────────────────────────────────────────────
    id_s = id_safe(row.get('id_albero', ''))
    ts_f = ts_to_fname(ts)
    foto_paths = find_foto(id_s, ts_f)
    avail = [(i, p) for i, p in enumerate(foto_paths) if p]

    if avail:
        section(' DOCUMENTAZIONE FOTOGRAFICA')
        y0 = pdf.get_y()
        iw = (W - 4) / 2
        ih = iw * 0.75
        for idx, (_, fpath) in enumerate(avail):
            col = idx % 2
            row_n = idx // 2
            x = 15 + col * (iw + 4)
            y = y0 + row_n * (ih + 4)
            try:
                pdf.image(fpath, x=x, y=y, w=iw, h=ih, keep_aspect_ratio=True)
            except Exception as e:
                print(f'  Attenzione foto {fpath}: {e}', file=sys.stderr)

    return bytes(pdf.output())


def main():
    os.makedirs(PDF_DIR, exist_ok=True)

    json_files = sorted(glob.glob(os.path.join(PDF_DIR, '*.json')))
    if not json_files:
        print('Nessun file JSON trovato — nessun PDF da generare.')
        return

    count = 0
    for json_path in json_files:
        pdf_path = json_path[:-5] + '.pdf'

        if os.path.exists(pdf_path):
            print(f'  Esiste: {pdf_path}')
            continue

        print(f'  Genero: {pdf_path}')
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                row = json.load(f)
            pdf_bytes = build_pdf(row)
            with open(pdf_path, 'wb') as f:
                f.write(pdf_bytes)
            count += 1
            print(f'  OK: {pdf_path}')
        except Exception as e:
            print(f'  ERRORE {pdf_path}: {e}', file=sys.stderr)

    print(f'\nGenerati {count} nuovi PDF.')


if __name__ == '__main__':
    main()
