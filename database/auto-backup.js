/*
    Equinoccio Technology
    Generador de Backups Automaticos - 23:00 de cada dia
*/

const { spawn } = require('child_process');
const path = require('path');
const moment = require('moment');
const cron = require('node-cron');

const DB_NAME = "edificarSRL";
const ARCHIVE_PATH = path.join(__dirname, '../backups', `${moment().format('DD-MM-YYYY')}.gzip`);

// Cron - Se ejecuta todos los dias a las 23:59 (Recordar - Debe tener 6 valores)
cron.schedule('00 23 * * * *',() => backupMongoDB());

// Backup MongoDB
function backupMongoDB() {

    const child = spawn('mongodump', [
        `--db=${DB_NAME}`,
        `--archive=${ARCHIVE_PATH}`,
        '--gzip'
    ]);

    child.stdout.on('data', (data) => {
        console.log('stdout:\n', data);
    });

    child.stderr.on('data', (data) => {
        console.log('stderr:\n', Buffer.from(data).toString());
    });

    child.on('error', (error) => {
        console.log('error:\n', error);
    });

    child.on('exit', (code, signal)=>{
        if(code) console.log('Process exit with code:', code);
        else if (signal) console.log('Process killed with signal', signal);
        else console.log('Backup is successfull!');
    });

}
