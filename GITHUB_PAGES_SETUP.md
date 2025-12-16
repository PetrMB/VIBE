# 🌐 Jak nastavit GitHub Pages pro Retro Camper

## Automatické nastavení (jednoduché)

1. **Jdi na GitHub repozitář**: https://github.com/PetrMB/VIBE

2. **Otevři Settings** (⚙️ ikona nahoře)

3. **V levém menu klikni na "Pages"**

4. **V sekci "Source":**
   - **Branch:** Vyber `claude/retro-camper-game-V11Hz`
   - **Folder:** Vyber `/ (root)`
   - Klikni **Save**

5. **Počkej cca 1-2 minuty** na build

6. **Hra bude dostupná na:**
   ```
   https://petrmb.github.io/VIBE/retro-camper/
   ```

---

## Alternativa: Použití gh-pages branch

Pokud chceš použít speciální gh-pages branch (doporučeno pro čistší URL):

### Na svém počítači (ne v Claude Code):

```bash
# 1. Naklonuj repo
git clone https://github.com/PetrMB/VIBE.git
cd VIBE

# 2. Vytvoř gh-pages branch
git checkout --orphan gh-pages

# 3. Smaž vše kromě retro-camper
git rm -rf .
git checkout claude/retro-camper-game-V11Hz -- retro-camper/

# 4. Vytvoř redirect index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=retro-camper/">
</head>
<body>Redirecting...</body>
</html>
EOF

# 5. Commit a push
git add .
git commit -m "Setup GitHub Pages"
git push origin gh-pages

# 6. V GitHub Settings -> Pages nastav:
#    Branch: gh-pages
#    Folder: / (root)
```

---

## 🎮 Po nastavení

Hra bude dostupná na jedné z těchto URL (podle zvolené metody):

- **Metoda 1:** `https://petrmb.github.io/VIBE/retro-camper/`
- **Metoda 2 (gh-pages):** `https://petrmb.github.io/VIBE/`

Build trvá obvykle **1-2 minuty**. Můžeš sledovat progress v záložce **Actions** na GitHubu.

---

## ✅ Ověření

1. Otevři URL v prohlížeči
2. Měl bys vidět hlavní menu hry
3. Klikni "NOVÁ HRA"
4. Užij si retro roadtrip! 🚐✨

---

## 🐛 Troubleshooting

**Hra se nenačte:**
- Zkontroluj konzoli v Developer Tools (F12)
- Ujisti se, že jsou všechny soubory commitnuté
- Počkej pár minut na GitHub Pages build

**404 Error:**
- Zkontroluj správnost URL
- Ověř nastavení v GitHub Settings -> Pages
- Ujisti se, že branch obsahuje správné soubory

---

**Happy camping! 🏕️**
