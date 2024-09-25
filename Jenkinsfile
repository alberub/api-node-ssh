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
                            *{
                                box-sizing: border-box;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #fff;
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            .container {
                                display: flex;
                                flex-direction: column;
                                align-items: center;            
                                width: 80%;
                                margin: 0 auto;
                                background-color: #f8f8f8;
                                padding: 20px;
                            }
                            /* *************************************************** */
                            .datos__generales{          
                            min-width: 640px;
                            max-width: 640px;
                            height: auto;
                            padding: 30px 0;          
                            }
                            .datos__logos{
                                display: flex;
                                justify-content: space-between;
                                align-items: center;                
                            }
                            .datos__logos .img__jenkins{
                                width: auto;
                                height: 30px;
                            }
                            .datos__logos .img__aws{
                                width: auto;
                                height: 50px;
                            }
                            .datos__build{
                                width: 100%;
                                height: 40px;
                                line-height: 40px;
                                margin-top: 10px;
                                /* border: 1px solid red;             */
                            }
                            .datos__build span:not(.icono){
                            font-size: 14px;
                            margin-left: 7px;
                            }
                            .datos__build .estatus{
                            font-size: 12px;
                            padding: 2px;
                            background-color: #fde293;          
                            }
                            .datos__generales .datos__build .icono{
                            height: 40px;
                            line-height: 40px;
                            color: red;
                            }
                            /* ********************************************* */
                            .datos__nombre{
                                font-size: 24px;
                                font-weight: bold;
                                margin-top: 20px;
                            }
                            .datos__tiempo{
                                margin-top: 20px;
                                font-size: 13px;
                            }
                            .datos__resultados{
                            margin-top: 20px;
                            }
                            .datos__resultados button{
                                color: white;
                                background-color: #0078d4;
                                font-size: 14px;
                                padding: 8px 12px;
                                border: none;
                                cursor: pointer;
                            }        
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="datos__generales">
                                <div class="datos__logos">
                                    <img class="img__jenkins" src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Jenkins_logo_with_title.svg" alt="">
                                    <img class="img__aws" src="https://www.grupoinversores.com/wp-content/uploads/2022/06/aws-logo-teaser-1.png" alt="">
                                </div>
                                <div class="datos__build">
                                    <span class="icono">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                        </svg>
                                    </span>              
                                    <span>BUILD #20240923.8</span>
                                    <span class="estatus">FAILED</span>
                                    
                                </div>
                                <div class="datos__nombre">
                                    <span>api-registro-express-nodejs-20</span>
                                </div>
                                <div class="datos__tiempo">
                                    <span>Ran for 32 seconds</span>
                                </div>
                                <div class="datos__resultados">
                                    <button class="boton">Ver resultados</button>
                                </div>
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
