from pathlib import Path
lines=Path('src/components/element/DataTable.tsx').read_text().splitlines()
for idx,line in enumerate(lines,1):
    if 60 <= idx <= 220:
        print(f\"{idx}: {line}\")
