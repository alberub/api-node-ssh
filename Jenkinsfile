pipeline {
    agent any
    
    environment {
        SSH_CREDENTIALS = credentials('sh-credentials')
        SERVER_IP = credentials('server_ip')
        APP_PATH = credentials('app_path')
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
                            mkdir -p "${env.APP_PATH}"
                        '
                        scp -r * \${SERVER_IP}:"${env.APP_PATH}"
                        ssh -o StrictHostKeyChecking=no \${SERVER_IP} '
                            cd "${env.APP_PATH}"
                            npm ci
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
                            cd "${env.APP_PATH}"
                            pm2 describe api-nodejs > /dev/null
                            if [ \$? -eq 0 ]; then
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