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
            width: 80%;
            margin: 0 auto;
            background-color: #f8f8f8;
            padding: 20px;
            padding: 0 calc((80% - 640px) / 2);
          }
          /* *************************************************** */
        .datos__generales{          
          width: 640px;
          height: auto;
          padding: 30px 0;          
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
              <img class="img__jenkins" src="https://wiki.jenkins-ci.org/JENKINS/attachments/2916393/57409619.png" alt="">
              <img class="img__aws" src="https://www.grupoinversores.com/wp-content/uploads/2022/06/aws-logo-teaser-1.png" alt="">                
            </div>
            <div class="datos__build">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/FailureIcon.png" alt="">              
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
