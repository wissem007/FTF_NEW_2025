const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

app.post('/deploy', (req, res) => {
    if (req.body.ref === 'refs/heads/master') {
        console.log('Déploiement déclenché depuis GitHub...');
        
        exec('./deploy.sh', { 
            cwd: '/var/www/frontend'
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('Erreur déploiement:', error);
                return res.status(500).send('Erreur déploiement');
            }
            console.log('Déploiement réussi:', stdout);
            res.send('Déploiement FTF réussi');
        });
    } else {
        res.send('Push ignoré - pas sur master');
    }
});

app.listen(3001, 'localhost', () => {
    console.log('Webhook FTF actif sur localhost:3001');
});