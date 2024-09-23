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
                        sh "ssh -o StrictHostKeyChecking=no root@159.223.183.48 'echo "Conexión SSH exitosa"'" 
                        error_exit()  // Asegúrate de que esto se llame correctamente
                        
                        // Crear directorio en el servidor
                        sh """
                            ssh -o StrictHostKeyChecking=no ${env.SERVER_IP} '
                                mkdir -p "${env.APP_PATH}" && 
                                echo "Directorio creado exitosamente"
                            '
                        """
                        error_exit()
                        
                        // Transferir archivos
                        sh """
                            scp -r * ${env.SERVER_IP}:"${env.APP_PATH}" && 
                            echo "Archivos transferidos exitosamente"
                        """
                        error_exit()
                        
                        // Instalar dependencias
                        sh """
                            ssh -o StrictHostKeyChecking=no ${env.SERVER_IP} '
                                cd "${env.APP_PATH}" && 
                                npm ci && 
                                echo "Dependencias instaladas exitosamente"
                            '
                        """
                        error_exit()
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
                            ssh -o StrictHostKeyChecking=no ${env.SERVER_IP} '
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
                        error_exit()
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

// Función para manejar errores
def error_exit() {
    error("Se produjo un error en la etapa actual.")
}
