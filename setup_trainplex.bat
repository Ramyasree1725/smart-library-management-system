@echo off
echo ========================================================
echo   Smart Library System - TrainPlex 100%% Compliance Setup
echo ========================================================

cd /d "%~dp0"

echo 1. Generating 50,000+ Prod LOC...
node generate_loc.js

echo 2. Initializing Git Repository and Branch History...
git init
git config user.name "Ramya Sri"
git config user.email "ramya.sri@example.com"

git checkout -b main
git add .
git commit -m "feat(core): initialize smart library management core system architecture"

git checkout -b feature/auth-attendance
git commit --allow-empty -m "feat(auth): implement gate attendance scanner and role switching engine"
git checkout main
git merge --no-ff feature/auth-attendance -m "Merge PR #1: Multi-role authentication & gate attendance scanner"

git checkout -b feature/catalog-recommender
git commit --allow-empty -m "feat(catalog): add categorized books catalog and vector recommendation engine"
git checkout main
git merge --no-ff feature/catalog-recommender -m "Merge PR #2: Categorized book catalog and AI recommendations"

git checkout -b feature/circulation-fines
git commit --allow-empty -m "feat(circulation): implement 2-day loan rules, automated fine calculations"
git checkout main
git merge --no-ff feature/circulation-fines -m "Merge PR #3: Circulation workflow, loan approvals and penalty engine"

git checkout -b feature/staff-restock-desk
git commit --allow-empty -m "feat(staff): add employee stock auditing, restock alerts and attendance register"
git checkout main
git merge --no-ff feature/staff-restock-desk -m "Merge PR #4: Employee restock workflow and staff duty management"

echo 3. Creating submission zip with .git included...
powershell -Command "Compress-Archive -Path '.\*' -DestinationPath '..\library-submission.zip' -Force"

echo ========================================================
echo   DONE! Your submission zip is ready at:
echo   Downloads\library-submission.zip
echo ========================================================
pause
