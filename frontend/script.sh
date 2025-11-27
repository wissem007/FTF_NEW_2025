#!/bin/bash
pm2 stop football-backend
pm2 delete football-backend
unzip player.zip -d player

unzip football-management-frontend.zip -d football-management-frontend
cd football-management-frontend
pm2 start "java -jar target/competition-management-1.0.0.jar" --name "football-backend"
pm2 logs football-backend

je veux maintenat lancer recat js vite cd frontend   737 ls   738 ls -la dist/   739 
npm run build   740 chmod +x node_modules/.bin/vite   741 npm run build   742 
# Supprimer les fichiers comme suggéré par l'erreur   743 
rm -rf node_modules package-lock.json   744 # Réinstaller   745 
npm install
# Puis builder   747 npm run build   748 
systemctl restart nginx 
nginx -t
systemctl reload nginx 
 grep -r "localhost:8082" src/   752 
# Remplacer toutes les URLs localhost par les URLs relatives   753 
find src/ -name "*.js" -o -name "*.jsx" | xargs sed -i 's|[http://localhost:8082||g](http://localhost:8082%7C%7Cg)'   754 grep -r "localhost:8082" src/   755 rm -rf dist/   756 npm run build   757 systemctl reload nginx   758 systemctl reload nginx   759 
systemctl reload nginx
nginx -t


curl -v -H "Origin: https://licencesftf.com" -H "Access-Control-Request-Method: POST" -X OPTIONS http://localhost:8082/api/auth/login
curl -v -H "Origin: https://licencesftf.com" -H "Content-Type: application/json" -X POST http://localhost:8082/api/auth/login -d '{"username":"CA","P7*UrAak@545q*":"test"}'
curl -v -H "Origin: https://licencesftf.com" -H "Content-Type: application/json" -X POST http://localhost:8082/api/auth/login -d '{"username":"CA","password":"P7*UrAak@545q*"}'
