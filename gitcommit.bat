@echo off
set PATH=C:\Program Files\Git\cmd;%PATH%
git add .
git commit -m "feat: add room creation, passcodes, and session validation"
git push origin main
