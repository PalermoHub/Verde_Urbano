#!/usr/bin/env python3
"""
LIPU - Genera schede PDF ispezioni alberi
Legge i file JSON in Lipu/schede_pdf/ e genera il PDF corrispondente se mancante.
Font DejaVu per supporto completo caratteri italiani (à, è, é, ì, ò, ù).
Uso: python genera_pdf.py [--force|-f] per rigenerare PDF esistenti.
"""
import glob
import io
import json
import os
import re
import sys

from fpdf import FPDF
from PIL import Image as PilImage

# ── Impostazioni foto ────────────────────────────────────────────────────────
FOTO_MAX_PX  = 1350   # max lato lungo px (900 * 1.5 = +50% risoluzione)
FOTO_QUALITY = 65     # qualità JPEG (55→65 per immagini più grandi)
FOTO_COLS    = 1      # colonne per pagina (1 = +50% rispetto al precedente 2)
FOTO_GAP_X   = 8      # mm gap orizzontale tra colonne
FOTO_GAP_Y   = 10     # mm gap verticale tra righe
# ─────────────────────────────────────────────────────────────────────────────


def compress_image(fpath: str) -> io.BytesIO:
    """Apre un'immagine, la ridimensiona e restituisce BytesIO JPEG compresso."""
    with PilImage.open(fpath) as img:
        img = img.convert('RGB')
        w, h = img.size
        if max(w, h) > FOTO_MAX_PX:
            scale = FOTO_MAX_PX / max(w, h)
            img = img.resize((int(w * scale), int(h * scale)), PilImage.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=FOTO_QUALITY, optimize=True)
        buf.seek(0)
    return buf

PDF_DIR  = 'Lipu/schede_pdf'
FOTO_DIR = 'Lipu/foto'

# Font DejaVu (Linux: fonts-dejavu-core; Windows: C:\Windows\Fonts)
if sys.platform == 'win32':
    FONT_DIR = r'C:\Windows\Fonts'
else:
    FONT_DIR = '/usr/share/fonts/truetype/dejavu'
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
    # 1) Prova prima il match esatto timestamp
    folder = os.path.join(FOTO_DIR, f'{id_s}_{ts_f}')
    if not os.path.isdir(folder):
        # 2) Fallback: cerca qualsiasi cartella che inizia con "{id_s}_"
        candidates = sorted(glob.glob(os.path.join(FOTO_DIR, f'{id_s}_*')))
        folder = candidates[0] if candidates else folder
    paths = []
    for i in range(1, 4):
        p = os.path.join(folder, f'foto_{i}.jpg')
        paths.append(p if os.path.exists(p) else None)
    return paths


def build_pdf(row: dict) -> bytes:
    pdf = FPDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(15, 15, 15)

    pdf.add_font(FONT_FAMILY, style='',  fname=FONT_R)
    pdf.add_font(FONT_FAMILY, style='B', fname=FONT_B)
    pdf.add_font(FONT_FAMILY, style='I', fname=FONT_I)

    def draw_header(pdf_obj):
        W = pdf_obj.epw
        pdf_obj.set_fill_color(*GREEN)
        pdf_obj.set_text_color(*WHITE)
        pdf_obj.set_font(FONT_FAMILY, 'B', 13)
        pdf_obj.cell(W, 9, 'LIPU · PROTOCOLLO TUTELA FAUNISTICA',
                     fill=True, align='C', new_x='LMARGIN', new_y='NEXT')
        pdf_obj.set_font(FONT_FAMILY, 'I', 9)
        pdf_obj.cell(W, 6, 'SCHEDA DI ISPEZIONE ALBERI PRIMA DEL TAGLIO',
                     fill=True, align='C', new_x='LMARGIN', new_y='NEXT')
        pdf_obj.ln(4)

    def section(title):
        W = pdf.epw
        pdf.set_fill_color(*GRAY_BG)
        pdf.set_draw_color(*GRAY_BD)
        pdf.set_text_color(*GREEN)
        pdf.set_font(FONT_FAMILY, 'B', 10)
        pdf.cell(W, 7, title, fill=True, border=1,
                 new_x='LMARGIN', new_y='NEXT')
        pdf.ln(1)

    def field_pair(lbl1, val1, lbl2=None, val2=None):
        W = pdf.epw
        half = W / 2 - 1
        pdf.set_font(FONT_FAMILY, '', 7)
        pdf.set_text_color(*MUTED)
        if lbl2:
            pdf.cell(half, 4, lbl1)
            pdf.cell(2, 4, '')
            pdf.cell(half, 4, lbl2, new_x='LMARGIN', new_y='NEXT')
        else:
            pdf.cell(W, 4, lbl1, new_x='LMARGIN', new_y='NEXT')
        pdf.set_font(FONT_FAMILY, 'B', 10)
        pdf.set_text_color(*DARK)
        if lbl2:
            pdf.cell(half, 6, str(val1 or '-'))
            pdf.cell(2, 6, '')
            pdf.cell(half, 6, str(val2 or '-'), new_x='LMARGIN', new_y='NEXT')
        else:
            pdf.cell(W, 6, str(val1 or '-'), new_x='LMARGIN', new_y='NEXT')
        pdf.ln(2)

    ts = row.get('timestamp', '')
    data_str = ts.split('T')[0] if 'T' in ts else ts[:10]

    # ── PAGINA 1 ────────────────────────────────────────────────────────────
    pdf.add_page()
    draw_header(pdf)
    W = pdf.epw

    # 1 · Dati operatore
    section(' 1 · DATI OPERATORE')
    field_pair('Operatore', row.get('nome_operatore', ''),
               'Ruolo', row.get('ruolo_operatore', ''))
    field_pair('Data ispezione', data_str,
               'Ora controllo', row.get('ora_controllo', ''))

    # 2 · Anagrafica albero
    section(' 2 · ANAGRAFICA ALBERO')
    field_pair('ID Albero', row.get('id_albero', ''),
               'Specie', row.get('specie', ''))
    field_pair('Altezza complessiva [m]',
               row.get('altezza_complessiva', '') or '-',
               'Altezza base chioma [m]',
               row.get('altezza_base_chioma', '') or '-')

    # 3 · Dati territorio
    section(' 3 · DATI TERRITORIO')
    lat = row.get('lat_albero', '')
    lon = row.get('lon_albero', '')
    lat_str = f'{float(lat):.6f}' if lat else '-'
    lon_str = f'{float(lon):.6f}' if lon else '-'
    field_pair('Latitudine', lat_str, 'Longitudine', lon_str)
    field_pair('Ubicazione', row.get('via', ''))
    field_pair('Circoscrizione', row.get('circoscrizione', '') or '-',
               'Quartiere', row.get('quartiere', '') or '-')
    field_pair('UPL', row.get('upl', '') or '-')

    # 4 · Dichiarazione operatore
    section(' 4 · DICHIARAZIONE OPERATORE')
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

    # 5 · Esito
    section(" 5 · ESITO DELL'ESAME")
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

    # 6 · Note aggiuntive
    section(' 6 · NOTE AGGIUNTIVE')
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.set_text_color(*DARK)
    pdf.multi_cell(W, 5, row.get('note', '') or 'Nessuna nota aggiuntiva.',
                   new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)

    # 7 · Firme di convalida
    section(' 7 · FIRME DI CONVALIDA')
    field_pair('Firma Operatore', row.get('firma_operatore', ''),
               'Firma Capocantiere', row.get('firma_capocantiere', ''))

    # ── PAGINA 2: Documentazione fotografica ────────────────────────────────
    id_s = id_safe(row.get('id_albero', ''))
    ts_f = ts_to_fname(ts)
    foto_paths = find_foto(id_s, ts_f)
    avail = [(i + 1, p) for i, p in enumerate(foto_paths) if p]

    if avail:
        pdf.add_page()
        draw_header(pdf)
        W    = pdf.epw
        PH   = pdf.h - pdf.b_margin   # y massima utilizzabile
        CAP  = 5                       # mm altezza didascalia + gap sotto
        section(' 8 · DOCUMENTAZIONE FOTOGRAFICA')

        # Larghezza foto: FOTO_COLS colonne
        iw = (W - FOTO_GAP_X * (FOTO_COLS - 1)) / FOTO_COLS
        ih = iw * 0.75   # aspect ratio 4:3

        # Se ih troppo grande per pagina, riduce proporzionalmente
        avail_h_page = PH - pdf.get_y() - 4  # spazio disponibile da qui a fondo
        rows_per_page = max(1, int(avail_h_page / (ih + FOTO_GAP_Y + CAP)))
        max_ih = (avail_h_page - rows_per_page * (FOTO_GAP_Y + CAP)) / rows_per_page
        if ih > max_ih:
            ih = max_ih
            iw = ih / 0.75

        col = 0   # colonna corrente
        for num, fpath in avail:
            # Se nuova riga e non c'è spazio: nuova pagina
            if col == 0:
                y = pdf.get_y() + 2
                if y + ih + CAP > PH:
                    pdf.add_page()
                    draw_header(pdf)
                    section(' 8 · DOCUMENTAZIONE FOTOGRAFICA (segue)')
                    y = pdf.get_y() + 2

            # Posizione x
            x = 15 + col * (iw + FOTO_GAP_X)

            try:
                buf = compress_image(fpath)
                pdf.image(buf, x=x, y=y, w=iw, h=ih, keep_aspect_ratio=True)
            except Exception as e:
                print(f'  Attenzione foto {fpath}: {e}', file=sys.stderr)

            # Didascalia
            pdf.set_xy(x, y + ih + 1)
            pdf.set_font(FONT_FAMILY, 'I', 7)
            pdf.set_text_color(*MUTED)
            pdf.cell(iw, 4, f'Foto {num}', align='C')

            col += 1
            if col >= FOTO_COLS:
                # Fine riga: avanza y
                pdf.set_xy(15, y + ih + CAP + FOTO_GAP_Y)
                col = 0

    return bytes(pdf.output())


def main():
    force = '--force' in sys.argv or '-f' in sys.argv
    os.makedirs(PDF_DIR, exist_ok=True)

    json_files = sorted(glob.glob(os.path.join(PDF_DIR, '*.json')))
    if not json_files:
        print('Nessun file JSON trovato — nessun PDF da generare.')
        return

    count = 0
    for json_path in json_files:
        pdf_path = json_path[:-5] + '.pdf'

        if os.path.exists(pdf_path) and not force:
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
