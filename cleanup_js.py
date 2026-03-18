
import os

path = r'c:\Users\julia\Desktop\cout de revient\pro-features.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix common mangled characters (UTF-8 bytes read as Windows-1252/Latin-1)
replacements = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ãª': 'ê',
    'Ã ': 'à',
    'Ã¹': 'ù',
    'Ã§': 'ç',
    'Ã‰': 'É',
    'Ã': 'à', # Often standalone Ã followed by space or something
    'preuve': 'Épreuve',
    'â ±ï¸ ': '⏱️',
    'â ¸ï¸ ': '⏸️',
    'Ã´': 'ô',
    'Ã¯': 'ï',
    'Ã«': 'ë',
    'Ã¢': 'â',
    'Ã»': 'û',
    'Ã®': 'î',
    'Ã¦': 'æ',
    'Å“': 'œ',
    'Â°C': '°C',
    'Ã©': 'é',
    'â€': '”',
    'â€œ': '“',
    'â€™': "'",
    'â€¦': '...',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# specifically for emojis that were broken
content = content.replace('âœ…', '✅')
content = content.replace('âŒ', '❌')
content = content.replace('âš ï¸ ', '⚠️')
content = content.replace('âž ', '➞')
content = content.replace('ðŸ“·', '📸')
content = content.replace('ðŸ“Š', '📊')
content = content.replace('ðŸ“‹', '📋')
content = content.replace('ðŸ’¡', '💡')
content = content.replace('ðŸ’¨', '💨')
content = content.replace('â­ ', '⭐')
content = content.replace('ðŸ„', '🐄')
content = content.replace('ðŸ’€', '💀')
content = content.replace('ðŸš¨', '🚨')
content = content.replace('âœ¨', '✨')
content = content.replace('ðŸ“', '🍓')
content = content.replace('ðŸ', '🍫')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned up encoding and emojis")
