
with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines):
    for char in line:
        if char == '{':
            balance += 1
        elif char == '}':
            balance -= 1
    if balance < 0:
        print(f"Error: unmatched }} at line {i+1}")
        balance = 0

print(f"Final balance: {balance}")
