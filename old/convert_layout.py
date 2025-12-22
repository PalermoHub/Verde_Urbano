#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script per convertire index.html in un layout moderno e responsive
con pannelli modali per sidebar, dettagli albero e grafici
"""

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(filepath, content):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def create_modern_layout():
    # Leggi il file originale
    original_html = read_file(r'D:\GitHub - Clone\SiciliaHub\Verde_Urbano\index.html')

    # Trova le sezioni principali
    head_start = original_html.find('<head>')
    head_end = original_html.find('</head>')
    body_start = original_html.find('<body>')
    body_end = original_html.find('</body>')
    script_section = original_html[original_html.find('<script>'):original_html.find('</script>') + 9]

    # Estrai lo stile originale
    style_start = original_html.find('<style>')
    style_end = original_html.find('</style>')
    original_styles = original_html[style_start:style_end + 8]

    # Crea i nuovi stili per i pannelli modali
    new_styles = """
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
            overflow-x: hidden;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
            display: flex;
            flex-direction: column;
        }

        /* HEADER FULL-WIDTH */
        header {
            background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
            color: white;
            padding: 20px 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            position: sticky;
            top: 0;
            z-index: 900;
        }

        header > div:first-child {
            flex: 1;
        }

        header h1 {
            font-size: 28px;
            margin-bottom: 5px;
            font-weight: 700;
        }

        header p {
            font-size: 14px;
            opacity: 0.95;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        /* PULSANTE HAMBURGER */
        .hamburger-btn {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .hamburger-btn:hover {
            background: rgba(255, 255, 255, 0.4);
            transform: scale(1.1);
        }

        .info-icon {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .info-icon:hover {
            background: rgba(255, 255, 255, 0.4);
            transform: scale(1.1);
        }

        /* CONTAINER PRINCIPALE */
        .main-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
        }

        /* MAPPA FULL-WIDTH */
        #map {
            width: 100%;
            height: 800px;
            background: white;
            z-index: 1;
        }

        /* OVERLAY PER MODALI */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .modal-overlay.active {
            display: block;
            opacity: 1;
        }

        /* PANNELLO MODALE SIDEBAR (SINISTRA) */
        .sidebar-modal {
            position: fixed;
            top: 0;
            left: -400px;
            width: 360px;
            height: 100vh;
            background: white;
            box-shadow: 4px 0 20px rgba(0,0,0,0.3);
            z-index: 1001;
            overflow-y: auto;
            transition: left 0.3s ease;
            padding: 20px;
        }

        .sidebar-modal.active {
            left: 0;
        }

        .sidebar-modal .close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: #e74c3c;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            z-index: 10;
        }

        .sidebar-modal .close-btn:hover {
            transform: rotate(90deg);
        }

        .sidebar-content {
            margin-top: 50px;
        }

        /* PANNELLO MODALE DETTAGLI ALBERO (DESTRA) */
        .tree-details-modal {
            position: fixed;
            top: 0;
            right: -500px;
            width: 450px;
            height: 100vh;
            background: white;
            box-shadow: -4px 0 20px rgba(0,0,0,0.3);
            z-index: 1002;
            overflow-y: auto;
            transition: right 0.3s ease;
            padding: 20px;
        }

        .tree-details-modal.active {
            right: 0;
        }

        .tree-details-modal .close-btn {
            position: sticky;
            top: 10px;
            float: right;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: #e74c3c;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            z-index: 10;
            margin-bottom: 10px;
        }

        .tree-details-modal .close-btn:hover {
            transform: rotate(90deg);
        }

        /* PANNELLO MODALE DATAVIZ (DESTRA 75%) */
        .dataviz-modal {
            position: fixed;
            top: 0;
            right: -100%;
            width: 75%;
            height: 100vh;
            background: white;
            box-shadow: -4px 0 20px rgba(0,0,0,0.3);
            z-index: 1003;
            overflow-y: auto;
            transition: right 0.3s ease;
            padding: 30px;
        }

        .dataviz-modal.active {
            right: 0;
        }

        .dataviz-modal .close-btn {
            position: sticky;
            top: 10px;
            float: right;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e74c3c;
            color: white;
            border: none;
            font-size: 22px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            z-index: 10;
            margin-bottom: 15px;
        }

        .dataviz-modal .close-btn:hover {
            transform: rotate(90deg);
        }

        /* STILI PER SIDEBAR */
        .sidebar h2 {
            font-size: 18px;
            margin-bottom: 15px;
            margin-top: 20px;
            color: #313131;
            border-bottom: 3px solid #27ae60;
            padding-bottom: 10px;
        }

        .filter-group {
            margin-bottom: 18px;
        }

        .filter-group label {
            display: block;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        select, input[type="range"], input[type="number"] {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 13px;
            font-family: inherit;
            transition: all 0.3s;
        }

        select:focus, input:focus {
            outline: none;
            border-color: #27ae60;
            box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
        }

        .filter-info {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
            font-style: italic;
        }

        .stats-box {
            background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #fff;
        }

        .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 13px;
        }

        .stat-value {
            font-weight: 700;
            font-size: 14px;
        }

        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        button {
            flex: 1;
            padding: 11px;
            background: #27ae60;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.3s;
        }

        button:hover {
            transform: translateY(-2px);
        }

        button.secondary {
            background: #95a5a6;
        }

        button.secondary:hover {
            background: #7f8c8d;
        }

        .info-banner {
            background: #e8f5e9;
            border-left: 4px solid #27ae60;
            padding: 12px;
            border-radius: 6px;
            font-size: 12px;
            color: #2e7d32;
            margin-bottom: 15px;
        }

        hr {
            border: 0;
            height: 1px;
            background: #1e8449;
            background-image: linear-gradient(to right, #eee, #1e8449, #eee);
            margin-top: 20px;
            margin-bottom: 20px;
        }

        /* DETTAGLI ALBERO */
        .tree-details {
            padding-top: 10px;
        }

        .tree-details h3 {
            color: #27ae60;
            margin-bottom: 15px;
            font-size: 18px;
        }

        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .detail-item {
            padding: 12px;
            background: #f9f9f9;
            border-radius: 6px;
            border-left: 4px solid #27ae60;
        }

        .detail-label {
            font-size: 11px;
            color: #888;
            font-weight: 700;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .detail-value {
            font-size: 14px;
            color: #333;
            word-break: break-word;
            font-weight: 500;
        }

        /* GRAFICI */
        .charts-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .chart-box {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            min-height: 350px;
        }

        .chart-box h3 {
            font-size: 16px;
            margin-bottom: 15px;
            color: #313131;
            border-bottom: 3px solid #27ae60;
            padding-bottom: 10px;
        }

        .chart-wrapper {
            position: relative;
            height: 300px;
            width: 100%;
        }

        /* MODAL INFO ORIGINALE */
        .modal {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1004;
            display: none;
        }

        .modal.active {
            display: block;
        }

        @keyframes slideUp {
            from {
                transform: translate(-50%, -40%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%);
                opacity: 1;
            }
        }

        .modal-header {
            background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
            color: white;
            padding: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 12px 12px 0 0;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 24px;
        }

        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
            flex-shrink: 0;
        }

        .modal-close:hover {
            transform: rotate(90deg);
        }

        .modal-body {
            padding: 30px;
        }

        .modal-section {
            margin-bottom: 25px;
        }

        .modal-section:last-child {
            margin-bottom: 0;
        }

        .modal-section h3 {
            color: #27ae60;
            font-size: 18px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .modal-section p {
            color: #555;
            line-height: 1.6;
            font-size: 14px;
            margin-bottom: 8px;
        }

        .modal-section ul {
            margin-left: 20px;
            color: #555;
            font-size: 14px;
            line-height: 1.8;
        }

        .modal-section li {
            margin-bottom: 6px;
        }

        .feature-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .feature-item {
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }

        .feature-icon {
            color: #27ae60;
            font-size: 18px;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .feature-text {
            color: #555;
            font-size: 14px;
            line-height: 1.5;
        }

        footer {
            background: #f9f9f9;
            border-top: 2px solid #27ae60;
            padding: 25px 20px;
            margin-top: 40px;
            text-align: center;
            color: #555;
            font-size: 13px;
            line-height: 1.6;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
        }

        footer h3 {
            color: #27ae60;
            font-size: 15px;
            margin-bottom: 12px;
            font-weight: 700;
        }

        footer p {
            max-width: 800px;
            margin: 0 auto;
            color: #666;
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 1200px) {
            .dataviz-modal {
                width: 90%;
            }
        }

        @media (max-width: 768px) {
            header h1 {
                font-size: 20px;
            }

            header p {
                font-size: 12px;
            }

            #map {
                height: 400px;
            }

            .sidebar-modal,
            .tree-details-modal,
            .dataviz-modal {
                width: 100%;
                left: -100%;
                right: auto;
            }

            .sidebar-modal.active,
            .tree-details-modal.active,
            .dataviz-modal.active {
                left: 0;
                right: auto;
            }

            .tree-details-modal {
                right: auto;
            }

            .dataviz-modal {
                right: auto;
            }

            .charts-container {
                grid-template-columns: 1fr;
            }

            .details-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            header {
                padding: 15px 20px;
            }

            #map {
                height: 350px;
            }

            .modal {
                width: 95%;
                max-height: 90vh;
            }
        }

        /* iOS SAFE AREA */
        @supports (padding: max(0px)) {
            header {
                padding-left: max(20px, env(safe-area-inset-left));
                padding-right: max(20px, env(safe-area-inset-right));
            }

            .sidebar-modal,
            .tree-details-modal,
            .dataviz-modal {
                padding-left: max(20px, env(safe-area-inset-left));
                padding-right: max(20px, env(safe-area-inset-right));
                padding-bottom: max(20px, env(safe-area-inset-bottom));
            }
        }

        .environmental-stats-section {
            grid-column: 1/-1;
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #fff;
            margin-top: 15px;
        }

        .environmental-stats-section .detail-label {
            color: rgba(255, 255, 255, 0.8);
        }

        .environmental-stats-section .detail-value {
            color: white;
            font-weight: 600;
        }

        .stat-section {
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .stat-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .stat-section-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .stat-section-row .detail-label {
            display: inline;
            margin: 0;
            text-transform: uppercase;
            font-size: 10px;
        }

        .stat-section-row .detail-value {
            display: inline;
            font-size: 13px;
        }

        .no-data {
            padding: 40px;
            text-align: center;
            color: #999;
            font-size: 14px;
        }
    </style>
    """

    return new_styles

if __name__ == "__main__":
    print("Creazione del nuovo layout moderno...")
    styles = create_modern_layout()
    print("Stili CSS creati con successo!")
    print(f"Lunghezza CSS: {len(styles)} caratteri")
