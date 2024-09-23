pipeline {
    agent any

    environment {
        SSH_CREDENTIALS = 'sshServer'  // ID de las credenciales SSH para el servidor
        SERVER_IP = '159.223.183.48'
        APP_PATH = '/var/www/api-node-ssh'
    }

    stages {
        stage('Instalar dependencias') {
            steps {
                // Transferir los archivos al servidor
                sshagent (credentials: [SSH_CREDENTIALS]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no root@${SERVER_IP} << EOF
                    mkdir -p ${APP_PATH}            
                    EOF
                    scp -r * root@${SERVER_IP}:${APP_PATH}
                    ssh -o StrictHostKeyChecking=no root@${SERVER_IP} << EOF
                    cd ${APP_PATH}
                    npm install
                    EOF
                    """
                }
            }
        }

        stage('Ejecutar aplicación con PM2') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no root@${SERVER_IP} << EOF
                    cd ${APP_PATH}
                    pm2 start index.js --name api-nodejs || pm2 restart api-nodejs
                    EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Despliegue completado con éxito!'
        }
        failure {
            echo 'Error durante el despliegue.'
        }
    }
}
