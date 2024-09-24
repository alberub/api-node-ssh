pipeline {
    agent any
    
    environment {
        SERVER_IP = '159.223.183.48'
        APP_PATH = '/var/www/api-node'
        SONAR_PROJECT_KEY = 'escaneo-api-node-ssh'
        SONAR_PROJECT_NAME = 'api-node-ssh'
        SONAR_PROJECT_VERSION = '1.0'
        API_NAME = 'Nombre de la api'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script{
                    env.GIT_COMMIT_AUTHOR_EMAIL = sh(script: "git log -1 --pretty=format:'%ae'", returnStdout: true).trim()
                    env.GIT_COMMIT_MESSAGE = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube server') {
                    sh '''                    
                    sonar-scanner \
                    -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                    -Dsonar.projectName=${SONAR_PROJECT_NAME} \
                    -Dsonar.projectVersion=${SONAR_PROJECT_VERSION} \
                    -Dsonar.sources=. \
                    -Dsonar.exclusions=**/node_modules/**
                    '''
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 1, unit: 'MINUTES') { // Puedes ajustar el tiempo de espera
                        def qualityGate = waitForQualityGate()
                        if (qualityGate.status != 'OK') {
                            error "La compuerta de calidad ha fallado con el estado: ${qualityGate.status}. Revisa el análisis de SonarQube para más detalles."
                        }
                    }
                }
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
                                cd "${env.APP_PATH}" && 
                                npm ci && 
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
        always {                        
            emailext body: """
                <html>
                <head>
                    <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 80%;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        text-align: center;
                        padding: 10px;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        padding: 20px;
                        text-align: left;
                    }
                    .content p {
                        line-height: 1.6;
                    }
                    .footer {
                        margin-top: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #666666;
                    }
                    </style>
                </head>
                <body>
                    <div class="container">
                    <div class="header">
                        <h1>Resultado del Pipeline para la API: ${env.API_NAME}</h1>
                    </div>
                    <div class="content">
                        <p>Hola,</p>
                        <p>Este es el resultado del último pipeline de la API <b>${env.API_NAME}</b>:</p>
                        <p>Estado del build: <b>${env.BUILD_STATUS}</b></p>
                        <p>Puedes ver más detalles del build <a href="${env.BUILD_URL}">aquí</a>.</p>
                    </div>
                    <div class="footer">
                        <p>Este es un mensaje automático generado por Jenkins.</p>
                    </div>
                    </div>
                </body>
                </html>
                """,
                subject: "Resultado del Pipeline: ${currentBuild.result} de ${env.API_NAME}",
                to: 'rios.alb2606@gmail.com',
                recipientProviders: [[$class: 'CulpritsRecipientProvider']]                
        }
    }
}
