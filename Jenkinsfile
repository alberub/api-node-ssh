pipeline {
    agent any
    
    environment {
        SERVER_IP = '159.223.183.48'
        APP_PATH = '/var/www/api-node'
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
                sshagent(credentials: ['ssh-credentials']) {
                    script {
                        echo "Intentando conectar a ${env.SERVER_IP}"
                        
                        // Verificar conexión SSH
                        sh "ssh -o StrictHostKeyChecking=no root@${env.SERVER_IP} 'echo \"Conexión SSH exitosa\"'" 
                        
                        // Crear directorio en el servidor
                        sh """
                            ssh -o StrictHostKeyChecking=no root@${env.SERVER_IP} '
                                mkdir -p "${env.APP_PATH}" && 
                                echo "Directorio creado exitosamente"
                            '
                        """
                        
                        // Transferir archivos
                        sh """
                            scp -r * root@${env.SERVER_IP}:"${env.APP_PATH}" && 
                            echo "Archivos transferidos exitosamente"
                        """
                        
                        // Instalar dependencias
                        sh """
                            ssh -o StrictHostKeyChecking=no root@${env.SERVER_IP} '
                                source ~/.nvm/nvm.sh && 
                                cd "${env.APP_PATH}" && 
                                /root/.nvm/versions/node/v22.9.0/bin/npm ci && 
                                echo "Dependencias instaladas exitosamente"
                            '
                        """
                    }
                }
            }
        }
        
        stage('Ejecutar aplicación con PM2') {
            steps {
                sshagent(credentials: ['ssh-credentials']) {
                    script {
                        echo "Iniciando/Reiniciando aplicación con PM2"
                        sh """
                            ssh -o StrictHostKeyChecking=no root@${env.SERVER_IP} '
                                cd "${env.APP_PATH}" &&
                                source ~/.nvm/nvm.sh &&  // Asegúrate de que nvm esté disponible
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
