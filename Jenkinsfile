pipeline {
    agent any
    
    environment {
        SSH_CREDENTIALS = credentials('ssh-credentials')  // Usa credentials() para manejar de forma segura
        SERVER_IP = credentials('server_ip')        // Usa credentials() para el IP del servidor
        APP_PATH = credentials('app_path')          // Usa credentials() para la ruta de la aplicación
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Preparación') {
            steps {
                script {
                    echo "Preparando despliegue en: ${env.APP_PATH}"
                }
            }
        }
        
        stage('Instalar dependencias y transferir archivos') {
            steps {
                sshagent(credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no \${SERVER_IP} '
                            mkdir -p ${APP_PATH}
                        '
                        scp -r * \${SERVER_IP}:${APP_PATH}
                        ssh -o StrictHostKeyChecking=no \${SERVER_IP} '
                            cd ${APP_PATH}
                            npm ci  # Usa npm ci en lugar de npm install para instalaciones más consistentes
                        '
                    """
                }
            }
        }
        
        stage('Ejecutar aplicación con PM2') {
            steps {
                sshagent(credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no \${SERVER_IP} '
                            cd ${APP_PATH}
                            pm2 describe api-nodejs > /dev/null
                            if [ $? -eq 0 ]; then
                                pm2 reload api-nodejs
                            else
                                pm2 start index.js --name api-nodejs
                            fi
                        '
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
            echo 'Error durante el despliegue. Revisa los logs para más detalles.'
        }
    }
}