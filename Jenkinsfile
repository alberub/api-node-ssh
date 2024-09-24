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
                                }
                                .container {
                                    width: 80%;
                                    margin: 0 auto;
                                    padding: 20px;
                                }
                                .table-container {
                                    width: 100%;
                                    border-spacing: 0;
                                }
                                .table-container td {
                                    padding: 10px;
                                }
                                .datos__logos img {
                                    height: 50px;
                                }
                                .datos__nombre span {
                                    font-size: 24px;
                                    font-weight: bold;
                                }
                                .datos__build {
                                    padding: 10px 0;
                                }
                                .build__status {
                                    background-color: #fde293;
                                    font-size: 13px;
                                    padding: 2px;
                                }
                                .button {
                                    background-color: #0078d4;
                                    color: white;
                                    padding: 10px 15px;
                                    border: none;
                                    text-decoration: none;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                            <table class="table-container" border="0" width="100%">
                                <tr class="datos__logos">
                                <td><img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Jenkins_logo_with_title.svg" alt="Jenkins"></td>
                                <td align="right"><img src="https://www.grupoinversores.com/wp-content/uploads/2022/06/aws-logo-teaser-1.png" alt="AWS"></td>
                                </tr>
                                <tr class="datos__build">
                                <td colspan="2">
                                    <strong>BUILD #20240923.8</strong> - <span class="build__status">FAILED</span>
                                </td>
                                </tr>
                                <tr class="datos__nombre">
                                <td colspan="2">
                                    <span>api-registro-express-nodejs-20</span>
                                </td>
                                </tr>
                                <tr class="datos__tiempo">
                                <td colspan="2">
                                    Ran for 32 seconds
                                </td>
                                </tr>
                                <tr class="datos__resultados">
                                <td colspan="2">
                                    <a href="#" class="button">Ver resultados</a>
                                </td>
                                </tr>
                                <tr class="mensaje__footer">
                                <td colspan="2" align="center">
                                    <p>Este es un mensaje automático generado por Jenkins.</p>
                                </td>
                                </tr>
                            </table>
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
