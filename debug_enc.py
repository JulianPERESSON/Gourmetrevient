
import os

path = r'c:\Users\julia\Desktop\cout de revient\pro-features.js'
encodings = ['utf-8', 'windows-1252', 'latin-1', 'utf-16']

for enc in encodings:
    try:
        with open(path, 'r', encoding=enc) as f:
            content = f.read()
            print(f"--- Encoding: {enc} ---")
            print(content[:500])
            break
    except Exception as e:
        print(f"Failed {enc}: {e}")
