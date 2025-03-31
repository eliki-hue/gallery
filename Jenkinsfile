pipeline {
    agent any

    environment {
        RENDER_URL = 'https://gallery-1uvx.onrender.com'
        RENDER_DEPLOY_HOOK = "${RENDER_DEPLOY_HOOK}"  // Use environment variable
        NPM_CONFIG_LOGLEVEL = 'info'
        EMAIL_TO = 'elijah.kiragu2@student.moringaschool.com'
    }

    stages {
        stage('Clone') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/eliki-hue/gallery.git',
                        credentialsId: 'github-credentials' // If private repo
                    ]],
                    extensions: [[
                        $class: 'CleanBeforeCheckout'
                    ]]
                ])
            }
        }

        stage('Install & Build') {
            steps {
                sh '''
                    echo "=== Clean Install ==="
                    rm -rf node_modules package-lock.json
                    npm cache clean --force
                    npm install
                    npm run build --if-present
                '''
            }
        }
          stage('Test') {
                steps {
                    script {
                    try {
                        sh 'npx mocha --exit --timeout 15000 test/*.js --color'

                        echo 'sending email'
                        emailext (
                            subject: "Test passed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                            body: """
                            <h2>Test Failure Notification</h2>
                            <p><b>Job:</b> ${env.JOB_NAME}</p>
                            <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                            <p><b>Console Output:</b> <a href="${env.BUILD_URL}console">View Logs</a></p>
                            <p><b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            """,
                            to: env.EMAIL_TO,
                            attachLog: true,
                            compressLog: true
                        }
                    } catch (err) {
                        emailext (
                            subject: "❌ Test Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                            body: """
                            <h2>Test Failure Notification</h2>
                            <p><b>Job:</b> ${env.JOB_NAME}</p>
                            <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                            <p><b>Console Output:</b> <a href="${env.BUILD_URL}console">View Logs</a></p>
                            <p><b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            """,
                            to: env.EMAIL_TO,
                            attachLog: true,
                            compressLog: true
                        )
                        error("Tests failed - email sent")
                    } 
               }
            }
        }
        stage('Trigger Render Deploy') {
            steps {
                 script {
            echo "RENDER_DEPLOY_HOOK = ${env.RENDER_DEPLOY_HOOK}"
            echo "Triggering Render deployment..."
            
            def response = httpRequest url: env.RENDER_DEPLOY_HOOK, consoleLogResponseBody: true
            
            echo "Response: ${response.content}"
        }
            }
        }
    }

    post {
        success {
            echo "✅ Successfully deployed to Render!"
            // slackSend(
            //     color: 'good',
            //     message: "Deployed: ${env.RENDER_URL}\nBuild: ${env.BUILD_URL}"
            // )
        }
        failure {
            echo "❌ Deployment failed!"
            // slackSend(
            //     color: 'danger',
            //     message: "Deployed: ${env.RENDER_URL}\nBuild: ${env.BUILD_URL}"
            // )
        }
    }
}
