
import os

path = r'c:\Users\julia\Desktop\cout de revient\pro-features.js'

# Try to read with Windows-1252 or Latin-1
try:
    with open(path, 'r', encoding='windows-1252') as f:
        content = f.read()
except:
    with open(path, 'r', encoding='latin-1') as f:
        content = f.read()

# Fix common issues
# (This is a bit risky but better than nothing)
# Actually, I'll just look for specific patterns from the grep output

content = content.replace('preuve', 'Épreuve')
content = content.replace('crite', 'écrite')
content = content.replace('peses', 'pesées')
content = content.replace('rglementaires', 'réglementaires')
content = content.replace('scnario', 'scénario')
content = content.replace('dmarrer', 'Démarrer')
content = content.replace('termine', 'terminée')
content = content.replace('frache', 'fraîche')
content = content.replace('oufs', 'oeufs')
content = content.replace('fonage', 'fonçage')
content = content.replace('ralisation', 'réalisation')
content = content.replace('lments', 'éléments')
content = content.replace('gnr', 'généré')
content = content.replace('prsentation', 'présentation')
content = content.replace('dtails', 'détails')
content = content.replace('catgorie', 'catégorie')
content = content.replace('tiquetage', 'étiquetage')

# Save as UTF-8
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed encoding and saved as UTF-8")
