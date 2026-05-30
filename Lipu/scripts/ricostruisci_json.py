#!/usr/bin/env python3
"""
Ricostruisce i file JSON in Lipu/schede_pdf/ leggendo ispezioni.csv + dati_alberi.csv.
Poi chiama genera_pdf.py --force per rigenerare tutti i PDF.
Uso: python Lipu/scripts/ricostruisci_json.py [--force-pdf]
"""
import csv
import json
import os
import re
import subprocess
import sys
from datetime import datetime

REPO_ROOT   = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CSV_ISPEZ   = os.path.join(REPO_ROOT, 'Lipu', 'dati', 'ispezioni.csv')
CSV_ALBERI  = os.path.join(REPO_ROOT, 'Lipu', 'dati', 'dati_alberi.csv')
PDF_DIR     = os.path.join(REPO_ROOT, 'Lipu', 'schede_pdf')
FOTO_DIR    = os.path.join(REPO_ROOT, 'Lipu', 'foto')
GENERA_PDF  = os.path.join(REPO_ROOT, 'Lipu', 'scripts', 'genera_pdf.py')
GITHUB_RAW  = 'https://raw.githubusercontent.com/PalermoHub/Verde_Urbano/main'


def id_safe(val):
    return re.sub(r'\s+', '_', str(val).strip())


def ts_to_fname(ts):
    return str(ts).replace(':', '-').replace('.', '-').replace('T', '_')[:19]


def normalizza_ora(raw):
    """Converte qualsiasi formato ora in HH:MM."""
    raw = str(raw).strip()
    # già HH:MM
    if re.match(r'^\d{2}:\d{2}$', raw):
        return raw
    # timestamp ISO
    if 'T' in raw:
        try:
            return raw.split('T')[1][:5]
        except Exception:
            pass
    # "Sat Dec 30 1899 HH:MM:SS GMT..."
    m = re.search(r'(\d{2}:\d{2}):\d{2}', raw)
    if m:
        return m.group(1)
    return raw[:5] if len(raw) >= 5 else raw


def load_alberi(path):
    alberi = {}
    with open(path, newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            alberi[str(row['ID albero']).strip()] = row
    return alberi


def foto_urls_locali(id_str, ts_fname):
    """Cerca foto nella cartella locale e restituisce URL GitHub raw."""
    folder = os.path.join(FOTO_DIR, f'{id_str}_{ts_fname}')
    urls = []
    for i in range(1, 4):
        p = os.path.join(folder, f'foto_{i}.jpg')
        if os.path.exists(p):
            urls.append(f'{GITHUB_RAW}/Lipu/foto/{id_str}_{ts_fname}/foto_{i}.jpg')
        else:
            urls.append('')
    return urls


def main():
    force_pdf = '--force-pdf' in sys.argv

    print(f'Carico alberi: {CSV_ALBERI}')
    alberi = load_alberi(CSV_ALBERI)

    os.makedirs(PDF_DIR, exist_ok=True)

    print(f'Leggo ispezioni: {CSV_ISPEZ}')
    with open(CSV_ISPEZ, newline='', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    print(f'Righe da processare: {len(rows)}')
    ok = 0
    for row in rows:
        ts       = str(row.get('timestamp', '')).strip()
        id_alb   = str(row.get('id_albero', '')).strip()
        if not ts or not id_alb:
            print(f'  SKIP riga incompleta: ts={ts!r} id={id_alb!r}')
            continue

        id_str   = id_safe(id_alb)
        ts_fname = ts_to_fname(ts)
        json_path = os.path.join(PDF_DIR, f'{id_str}_{ts_fname}.json')

        # Dati da dati_alberi.csv
        alb = alberi.get(id_alb, {})
        specie    = alb.get('Nome scientifico') or alb.get('Genere') or ''
        via       = alb.get('Odonimo') or ''
        circ      = row.get('Circoscrizione') or alb.get('Circoscrizione') or ''
        quart     = row.get('Quartiere') or alb.get('Quartiere') or ''
        upl       = row.get('UPL') or alb.get('UPL') or ''
        lat       = row.get('lat') or alb.get('Lat') or ''
        lon       = row.get('long') or alb.get('Long') or ''
        alt_compl = row.get('Altezza complessiva [m]') or alb.get('Altezza complessiva [m]') or ''
        alt_base  = row.get('Altezza della base della chioma [m]') or \
                    alb.get('Altezza della base della chioma [m]') or ''

        # Ora controllo normalizzata
        ora = normalizza_ora(row.get('ora_controllo', ''))

        # URL foto: preferisce quelle nel CSV, altrimenti cerca in locale
        def _u(k):
            v = str(row.get(k, '')).strip()
            return v if v.startswith('http') else ''

        u1, u2, u3 = _u('url_foto_1'), _u('url_foto_2'), _u('url_foto_3')
        if not u1:
            loc = foto_urls_locali(id_str, ts_fname)
            u1, u2, u3 = loc

        pdf_url = str(row.get('url_pdf', '')).strip()
        if not pdf_url.startswith('http'):
            pdf_url = f'{GITHUB_RAW}/Lipu/schede_pdf/{id_str}_{ts_fname}.pdf'

        record = {
            'timestamp':           ts,
            'id_albero':           id_alb,
            'specie':              specie,
            'via':                 via,
            'circoscrizione':      circ,
            'quartiere':           quart,
            'upl':                 upl,
            'lat_albero':          lat,
            'lon_albero':          lon,
            'altezza_complessiva': alt_compl,
            'altezza_base_chioma': alt_base,
            'id_operatore':        str(row.get('id_operatore ', row.get('id_operatore', ''))).strip(),
            'nome_operatore':      str(row.get('nome_operatore', '')).strip(),
            'ruolo_operatore':     str(row.get('ruolo_operatore', '')).strip(),
            'ora_controllo':       ora,
            'nido_visibile':       str(row.get('nido_visibile', '')).strip(),
            'richiami':            str(row.get('richiami', '')).strip(),
            'andirivieni':         str(row.get('andirivieni', '')).strip(),
            'esito':               str(row.get('esito', '')).strip(),
            'note':                str(row.get('note', '')).strip(),
            'firma_operatore':     str(row.get('firma_operatore', '')).strip(),
            'firma_capocantiere':  str(row.get('firma_capocantiere', '')).strip(),
            'url_foto_1':          u1,
            'url_foto_2':          u2,
            'url_foto_3':          u3,
            'url_pdf':             pdf_url,
        }

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(record, f, ensure_ascii=False, indent=2)
        ok += 1

    print(f'\nJSON scritti: {ok} / {len(rows)}')

    # Genera PDF
    cmd = [sys.executable, GENERA_PDF]
    if force_pdf:
        cmd.append('--force')
    print(f'\nAvvio genera_pdf.py {"--force" if force_pdf else ""}...')
    result = subprocess.run(cmd, cwd=REPO_ROOT)
    print(f'genera_pdf.py terminato con codice {result.returncode}')


if __name__ == '__main__':
    main()
