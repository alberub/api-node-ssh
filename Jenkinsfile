pipeline {
    agent any
    
    environment {
        SSH_CREDENTIALS = credentials('ssh-credentials')
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
                    echo "IP del servidor: ${env.SERVER_IP}"
                    sh 'env | sort'  // Imprime todas las variables de entorno
                }
            }
        }
        
        stage('Instalar dependencias y transferir archivos') {
            steps {
                sshagent(credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                        echo "Intentando conectar a ${env.SERVER_IP}"
                        ssh -o StrictHostKeyChecking=no \${SERVER_IP} 'echo "Conexión SSH exitosa"'
                        
                        echo "Creando directorio ${env.APP_PATH}"
                        ssh -o StrictHostKeyChecking=no \${SERVER_IP} '
                            mkdir -p "${env.APP_PATH}" && echo "Directorio creado exitosamente"
                        '
                        
                        echo "Transfiriendo archivos"
                        scp -r * \${SERVER_IP}:"${env.APP_PATH}" && echo "Archivos transferidos exitosamente"
                        
                        echo "Instalando dependencias"
                        ssh -o StrictHostKeyChecking=no \${SERVER_IP} '
                            cd "${env.APP_PATH}" && 
                            npm ci && 
                            echo "Dependencias instaladas exitosamente"
                        '
                    """
                }
            }
        }
        
        stage('Ejecutar aplicación con PM2') {
            steps {
                sshagent(credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                        echo "Iniciando/Reiniciando aplicación con PM2"
                        ssh -o StrictHostKeyChecking=no \${SERVER_IP} '
                            cd "${env.APP_PATH}" &&
                            if pm2 describe api-nodejs > /dev/null; then
                                echo "Reiniciando aplicación existente"
                                pm2 reload api-nodejs && echo "Aplicación reiniciada exitosamente"
                            else
                                echo "Iniciando nueva instancia de la aplicación"
                                pm2 start index.js --name api-nodejs && echo "Nueva instancia iniciada exitosamente"
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
            echo 'Error durante el despliegue. Revisa los logs anteriores para más detalles.'
        }
    }
}