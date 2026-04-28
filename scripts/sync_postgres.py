#!/usr/bin/env python3
"""Full sync: CSV dati/ → PostgreSQL/PostGIS 'palermo-verde-urbano'.
Insert new rows, update changed rows, delete stale rows.
01_query_rilievo_semplificato and 17_query_web get PostGIS geometry from Lat/Long."""

import math
import os
import re
import sys
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

DATI_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dati')

PG_CONNECTION = os.environ['PG_CONNECTION']  # postgresql://user:pass@host:5432/dbname

# pk:             list of PK column names (after sanitization)
# rename:         dict original→new applied before sanitization
# geometry:       {'lat': col_name, 'lon': col_name} after sanitization
# truncate_reload: True = TRUNCATE + INSERT (pivot/aggregation tables, no stable PK)
TABLE_CONFIG = {
    '01_query_rilievo_semplificato': {
        'pk': ['targa'],
        'rename': {'Log': 'Long'},
        'geometry': {'lat': 'lat', 'lon': 'long'},
    },
    '02_quadrante': {
        'pk': ['id'],
    },
    '03_tavole': {
        'pk': ['tav'],
    },
    '04_foto': {
        'pk': ['codvia'],
    },
    '05_specie_arboree_palermo': {
        'pk': ['specie'],
    },
    '06_elenco_prezzi_2024': {
        'pk': ['codice'],
    },
    '07_specie': {
        'pk': ['odonimo', 'specie'],
    },
    '08_cpc': {
        'pk': ['odonimo', 'cpc'],
    },
    '09_costo_lavori_vie': {
        'truncate_reload': True,
    },
    '10_o2_co2': {
        'pk': ['odonimo', 'ambiente'],
        'rename': {'Unnamed: 2': 'valore'},
    },
    '11_sito_impianto': {
        'truncate_reload': True,
    },
    '12_altezza_diametro': {
        'truncate_reload': True,
    },
    '13_altezza': {
        'truncate_reload': True,
    },
    '14_co2_diametro': {
        'truncate_reload': True,
    },
    '15_num_foglie': {
        'pk': ['id'],
    },
    '16_tot_foglie': {
        'truncate_reload': True,
    },
    '17_query_web': {
        'pk': ['targa'],
        'rename': {'Log': 'Long'},
        'geometry': {'lat': 'lat', 'lon': 'long'},
    },
}


def sanitize_col(name: str) -> str:
    name = str(name).strip().lower()
    name = re.sub(r'[^a-z0-9]+', '_', name)
    name = name.strip('_')
    return name or 'col'


def dedupe_cols(cols: list) -> list:
    seen: dict = {}
    result = []
    for c in cols:
        if c not in seen:
            seen[c] = 0
            result.append(c)
        else:
            seen[c] += 1
            result.append(f'{c}_{seen[c]}')
    return result


def clean_val(v):
    if v is None or v == '':
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    return v


def read_csv(path: str, config: dict) -> pd.DataFrame:
    df = pd.read_csv(path, dtype=str, keep_default_na=False)

    # Apply renames before sanitization
    df = df.rename(columns=config.get('rename', {}))

    # Drop unnamed columns that are entirely empty (trailing commas in header)
    drop_cols = [
        c for c in df.columns
        if str(c).startswith('Unnamed:') and df[c].str.strip().eq('').all()
    ]
    if drop_cols:
        df = df.drop(columns=drop_cols)

    # Sanitize and deduplicate column names
    df.columns = dedupe_cols([sanitize_col(c) for c in df.columns])

    # Replace empty strings with None (replace avoids float('nan') from df.where)
    df = df.replace('', None)

    return df


def ensure_postgis(cur):
    cur.execute('CREATE EXTENSION IF NOT EXISTS postgis')


def ensure_table(cur, table_name: str, df: pd.DataFrame, has_geom: bool, pk_cols: list):
    cur.execute(
        """SELECT EXISTS (
               SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = %s
           )""",
        (table_name,),
    )
    if not cur.fetchone()[0]:
        col_defs = [f'"{c}" TEXT' for c in df.columns]
        if has_geom:
            col_defs.append('"geom" GEOMETRY(Point, 4326)')
        pk_clause = (
            f', PRIMARY KEY ({", ".join(f"{chr(34)}{c}{chr(34)}" for c in pk_cols)})'
            if pk_cols else ''
        )
        cur.execute(f'CREATE TABLE "{table_name}" ({", ".join(col_defs)}{pk_clause})')
        if has_geom:
            cur.execute(f'CREATE INDEX ON "{table_name}" USING GIST (geom)')
        print(f'  Created table {table_name}')
    else:
        cur.execute(
            """SELECT column_name FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = %s""",
            (table_name,),
        )
        existing = {row[0] for row in cur.fetchall()}
        for col in df.columns:
            if col not in existing:
                cur.execute(f'ALTER TABLE "{table_name}" ADD COLUMN "{col}" TEXT')
                print(f"  Added column '{col}' to {table_name}")
        if has_geom and 'geom' not in existing:
            cur.execute(f'ALTER TABLE "{table_name}" ADD COLUMN "geom" GEOMETRY(Point, 4326)')
            cur.execute(f'CREATE INDEX ON "{table_name}" USING GIST (geom)')
            print(f'  Added geom column to {table_name}')


def delete_stale(cur, table_name: str, df: pd.DataFrame, pk_cols: list):
    pk_rows = [
        tuple(clean_val(v) for v in row)
        for row in df[pk_cols].drop_duplicates().dropna(how='all').itertuples(index=False, name=None)
    ]
    if not pk_rows:
        return
    col_refs = ', '.join(f'"{c}"' for c in pk_cols)
    execute_values(
        cur,
        f'DELETE FROM "{table_name}" WHERE ({col_refs}) NOT IN (VALUES %s)',
        pk_rows,
    )
    deleted = cur.rowcount
    if deleted > 0:
        print(f'  Deleted {deleted} stale rows from {table_name}')


def sync_table(conn, table_name: str, df: pd.DataFrame, config: dict):
    pk_cols = config.get('pk', [])
    geom_cfg = config.get('geometry')
    truncate = config.get('truncate_reload', False)
    has_geom = bool(geom_cfg)
    cols = list(df.columns)
    col_list = ', '.join(f'"{c}"' for c in cols)

    with conn.cursor() as cur:
        ensure_table(cur, table_name, df, has_geom, pk_cols)
        conn.commit()

        if truncate or not pk_cols:
            cur.execute(f'TRUNCATE TABLE "{table_name}"')
            rows = [tuple(clean_val(v) for v in row) for row in df.itertuples(index=False, name=None)]
            execute_values(cur, f'INSERT INTO "{table_name}" ({col_list}) VALUES %s', rows)
            conn.commit()
            print(f'  {table_name}: truncate+reload, {len(rows)} rows')
            return

        # Deduplicate CSV rows by PK (source data may have duplicates)
        before = len(df)
        df = df.drop_duplicates(subset=pk_cols, keep='last')
        if len(df) < before:
            print(f'  Dropped {before - len(df)} duplicate PK rows')
        cols = list(df.columns)
        col_list = ', '.join(f'"{c}"' for c in cols)

        # Build ON CONFLICT clause
        pk_str = ', '.join(f'"{c}"' for c in pk_cols)
        update_cols = [c for c in cols if c not in pk_cols]

        if has_geom:
            geom_update = ', "geom" = EXCLUDED."geom"'
            update_set = (
                ', '.join(f'"{c}" = EXCLUDED."{c}"' for c in update_cols) + geom_update
                if update_cols else '"geom" = EXCLUDED."geom"'
            )
            on_conflict = f'ON CONFLICT ({pk_str}) DO UPDATE SET {update_set}'

            col_list_geom = col_list + ', "geom"'
            template = (
                '(' + ', '.join(['%s'] * len(cols)) +
                ', ST_SetSRID(ST_MakePoint(%s::double precision, %s::double precision), 4326))'
            )
            insert_sql = f'INSERT INTO "{table_name}" ({col_list_geom}) VALUES %s {on_conflict}'

            lat_col = geom_cfg['lat']
            lon_col = geom_cfg['lon']
            lat_idx = cols.index(lat_col) if lat_col in cols else None
            lon_idx = cols.index(lon_col) if lon_col in cols else None

            rows = []
            for row in df.itertuples(index=False, name=None):
                vals = tuple(clean_val(v) for v in row)
                try:
                    lon = float(row[lon_idx]) if lon_idx is not None and row[lon_idx] not in (None, '') else None
                    lat = float(row[lat_idx]) if lat_idx is not None and row[lat_idx] not in (None, '') else None
                except (ValueError, TypeError):
                    lon, lat = None, None
                rows.append(vals + (lon, lat))

            execute_values(cur, insert_sql, rows, template=template)
        else:
            if update_cols:
                update_set = ', '.join(f'"{c}" = EXCLUDED."{c}"' for c in update_cols)
                on_conflict = f'ON CONFLICT ({pk_str}) DO UPDATE SET {update_set}'
            else:
                on_conflict = f'ON CONFLICT ({pk_str}) DO NOTHING'

            insert_sql = f'INSERT INTO "{table_name}" ({col_list}) VALUES %s {on_conflict}'
            rows = [tuple(clean_val(v) for v in row) for row in df.itertuples(index=False, name=None)]
            execute_values(cur, insert_sql, rows)

        # Full sync: remove rows no longer in CSV
        delete_stale(cur, table_name, df, pk_cols)

        conn.commit()
        print(f'  {table_name}: upsert, {len(rows)} rows')


def main():
    print(f'Connecting to {PG_CONNECTION.split("@")[-1]}')
    try:
        conn = psycopg2.connect(PG_CONNECTION)
    except Exception as e:
        print(f'Connection failed: {e}', file=sys.stderr)
        sys.exit(1)

    with conn.cursor() as cur:
        ensure_postgis(cur)
    conn.commit()

    errors = []
    for table_key, config in TABLE_CONFIG.items():
        csv_path = os.path.join(DATI_DIR, f'{table_key}.csv')
        if not os.path.exists(csv_path):
            print(f'Not found: {csv_path}, skipping')
            continue

        print(f'\nProcessing {table_key}...')
        try:
            df = read_csv(csv_path, config)
            if df.empty or len(df.columns) == 0:
                print('  Empty file, skipping')
                continue
            sync_table(conn, table_key, df, config)
        except Exception as e:
            print(f'  Error: {e}', file=sys.stderr)
            conn.rollback()
            errors.append((table_key, str(e)))

    conn.close()

    if errors:
        print(f'\nErrors in {len(errors)} tables:')
        for t, e in errors:
            print(f'  {t}: {e}')
        sys.exit(1)

    print('\nSync complete')


if __name__ == '__main__':
    main()
