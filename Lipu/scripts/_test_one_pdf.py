import glob, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
import genera_pdf as g

json_path = sorted(glob.glob('Lipu/schede_pdf/*.json'))[0]
pdf_path  = json_path[:-5] + '.pdf'
if os.path.exists(pdf_path):
    os.remove(pdf_path)
print('Test su:', json_path)
with open(json_path, encoding='utf-8') as f:
    row = json.load(f)
pdf_bytes = g.build_pdf(row)
with open(pdf_path, 'wb') as f:
    f.write(pdf_bytes)
print(f'OK -> {pdf_path}  ({os.path.getsize(pdf_path)//1024} KB)')
