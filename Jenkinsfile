pipeline {
    agent any
    
    environment {
        SERVER_IP = '159.223.183.48'
        APP_PATH = '/var/www/api-node'
        SONAR_PROJECT_KEY = 'escaneo-api-node-ssh'
        SONAR_PROJECT_NAME = 'api-node-ssh'
        SONAR_PROJECT_VERSION = '1.0'
        API_NAME = 'api-registro-express-nodejs-20'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script{
                    env.GIT_COMMIT_AUTHOR_EMAIL = sh(script: "git log -1 --pretty=format:'%ae'", returnStdout: true).trim()
                    env.GIT_COMMITTER_NAME      = sh(script: "git log -1 --pretty=format:'%an'", returnStdout: true).trim()
                    env.GIT_COMMIT_MESSAGE      = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                    env.GIT_BRANCH_NAME         = sh(script: 'git branch --show-current', returnStdout: true).trim()
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
            script{                

                def sonarHostUrl = "http://198.199.86.210:9000"
                env.SONAR_REPORT_URL = "${sonarHostUrl}/dashboard?id=${env.SONAR_PROJECT_KEY}"

                def buildDuration = currentBuild.durationString ?: "N/A"
                                                
                def currentDate = new Date()
                def formattedEndTime = currentDate.format('yyyy-MM-dd HH:mm:ss')
                                
                env.BUILD_DURATION = buildDuration
                env.BUILD_END_TIME = formattedEndTime

                def buildNumber = env.BUILD_NUMBER
                def formattedDate = currentDate.format('yyyyMMdd')
                env.newBuildName = "${formattedDate}.${buildNumber}"
            }                   
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
                                width: 80%;
                                margin: 0 auto;
                                background-color: #ffffff;                        
                            }
                            /* *************************************************** */
                            .datos__generales{                    
                            height: auto;
                            padding: 30px 0;      
                            padding: 30px calc((100% - 640px) / 2);    
                            }
                            /* *************************************************** */
                            .datos__logos{
                                width: 100%;
                                height: 40px;
                                line-height: 40px;            
                            }
                            .datos__logos .img__jenkins{
                                width: auto;
                                height: 30px;
                                float: left;
                            }
                            .datos__logos .img__aws{
                                width: auto;
                                height: 40px;
                                float: right;
                            }
                            /* ******************************************************* */
                            .datos__build{
                                width: 100%;
                                height: 40px;
                                line-height: 40px;
                                margin-top: 10px;            
                            }
                            .datos__build span:not(.icono){
                            font-size: 12px;
                            margin-left: 7px;
                            }
                            .datos__build .estatus{
                            font-size: 12px;
                            padding: 2px;
                            background-color: #fde293;          
                            }
                    
                            .datos__build img{
                            width: 16px;
                            height: 16px;          
                            }
                            /* ********************************************* */
                            .datos__nombre{
                                width: 100%;
                                height: 40px;            
                                font-size: 24px;
                                font-weight: bold;
                                margin-top: 20px;
                            }
                            .datos__tiempo{
                                width: 100%;
                                height: 40px;
                                margin-top: 20px;
                                font-size: 13px;
                            }
                            .datos__resultados{
                            width: 100%;
                            height: 40px;
                            margin-top: 20px;
                            }
                            .datos__resultados a{
                                color: white;
                                background-color: #0078d4;
                                font-size: 14px;
                                padding: 8px 12px;
                                border: none;
                                text-decoration: none;
                                cursor: pointer;
                            }      
                            /* ********************************************* */
                            .detalles{        
                            height: auto;
                            padding: 30px 0;      
                            padding: 30px calc((100% - 640px) / 2);
                            background-color: #f8f8f8;        
                            }
                            .detalles__card{
                            width: 100%;
                            height: auto;
                            background-color: #ffffff;
                            padding: 20px;
                            margin-bottom: 30px;
                            }
                            .card__titulo{
                            width: 100%;
                            height: 25px;
                            line-height: 25px;
                            font-size: 21px;
                            font-weight: 600;
                            }
                            .card__datos{
                            width: 100%;
                            height: auto;
                            padding-top: 12px;              
                            }
                            .card__datos .datos__info{
                            width: 100%;
                            height: 40px;
                            line-height: 40px;                  
                            border: 1px solid red;
                            }        
                            .datos__info .titulo{
                            font-size: 13px;
                            font-weight: 600;
                            width: 30%;
                            height: 100%;          
                            }
                            .datos__info .desc{
                            font-size: 14px;               
                            }
                            .detalles__build{
                            padding-top: 12px;          
                            }

                            .detalles__build p{
                            margin: 0;
                            font-size: 14px;
                            }
                            .mensaje__footer{
                            font-size: 13px;
                            color: gray;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="datos__generales">
                                <div class="datos__logos">
                                <img class="img__jenkins" src="https://wiki.jenkins-ci.org/JENKINS/attachments/2916393/57409619.png" alt="">
                                <img class="img__aws" src="https://www.grupoinversores.com/wp-content/uploads/2022/06/aws-logo-teaser-1.png" alt="">                
                                </div>
                                <div class="datos__build">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/FailureIcon.png" alt="">              
                                    <span>BUILD #${env.newBuildName}</span>
                                    <span class="estatus">${currentBuild.result}</span>
                                    
                                </div>
                                <div class="datos__nombre">
                                    <span>${env.API_NAME}</span>
                                </div>
                                <div class="datos__tiempo">
                                    <span>Ran for ${env.BUILD_DURATION}</span>
                                </div>
                                <div class="datos__resultados">
                                    <a class="boton" href="https://google.com.mx" target="_blank">Ver resultados</a>
                                </div>
                            </div>     
                            <div class="detalles">
                            <div class="detalles__card">
                                <div class="card__titulo">
                                    <span>Pull request</span>
                                </div>
                                <table class="card__datos">
                                    <tr class="datos__info">
                                        <td class="titulo">Title</td>
                                        <td class="desc">${env.GIT_COMMIT_MESSAGE}</td>
                                    </tr>
                                    <tr class="datos__info">
                                        <td class="titulo">Source branch</td>
                                        <td class="desc">devConflicts</td>
                                    </tr>
                                    <tr class="datos__info">
                                        <td class="titulo">Target branch</td>
                                        <td class="desc">develop</td>
                                    </tr>
                                    <tr class="datos__info">
                                        <td class="titulo">Description</td>
                                        <td class="desc">PR de devConflicts - develop</td>
                                    </tr>
                                    </table>

                            </div>

                            <div class="detalles__card">
                                <div class="card__titulo">
                                    <span>Summary</span>
                                </div>
                                <table class="card__datos">
                                    <tr class="datos__info">
                                        <td class="titulo">Build pipeline</td>
                                        <td class="desc">${env.API_NAME}</td>
                                    </tr>
                                    <tr class="datos__info">
                                        <td class="titulo">Finished</td>
                                        <td class="desc">${env.BUILD_END_TIME}</td>
                                    </tr>
                                    <tr class="datos__info">
                                        <td class="titulo">Requested for</td>
                                        <td class="desc">${env.GIT_COMMITTER_NAME}</td>
                                    </tr>
                                    <tr class="datos__info">
                                        <td class="titulo">Reason</td>
                                        <td class="desc">Privates</td>
                                    </tr>
                                </table>
                            </div>

                            <div class="detalles__card">
                                <div class="card__titulo">
                                    <span>Details</span>
                                </div>
                                <div class="detalles__build">
                                <p>Build</p>
                                <p>0 erro(s), 0 warning(s)</p>
                                </div>
                            </div>

                            <span class="mensaje__footer">Este mensaje ha sido generado automáticamente por Jenkins.</span>
                            </div>

                        </div>
                    </body>
                    </html>
                """,
                subject: "[PR build ${currentBuild.result}] - ${env.API_NAME} - ${env.GIT_BRANCH_NAME}",
                to: 'rios.alb2606@gmail.com',
                recipientProviders: [[$class: 'CulpritsRecipientProvider']]                
        }
    }
}
