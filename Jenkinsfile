pipeline {
    agent any

    environment {
        RENDER_URL = 'https://gallery-1uvx.onrender.com'
        RENDER_DEPLOY_HOOK = credentials('RENDER_DEPLOY_HOOK') // Store in Jenkins credentials
        NPM_CONFIG_LOGLEVEL = 'info'
    }

    tools {
        nodejs 'nodejs'
    }

    stages {
        stage('Clone') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/eliki-hue/gallery.git',
                        credentialsId: 'github-credentials' // Add if private repo
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
                sh '''
                    echo "=== Running Tests ==="
                    npx mocha --exit --timeout 15000 test/*.js --color
                '''
            }
            post {
                always {
                    junit testResults: 'test-results.xml', allowEmptyResults: true
                }
            }
        }

        stage('Trigger Render Deploy') {
            when {
                branch 'master'
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                script {
                    echo "Triggering Render deployment..."
                    def deployResponse = httpRequest url: env.RENDER_DEPLOY_HOOK, 
                                                  validResponseCodes: '200,201,202'
                    echo "Deploy response: ${deployResponse.content}"
                    
                    // Verify deployment status
                    timeout(time: 5, unit: 'MINUTES') {
                        waitUntil {
                            def healthCheck = sh script: "curl -s -o /dev/null -w '%{http_code}' ${env.RENDER_URL}", 
                                          returnStdout: true
                            echo "Health check status: ${healthCheck}"
                            return healthCheck == '200'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo "=== Pipeline Complete ==="
            archiveArtifacts artifacts: 'server.log', allowEmptyArchive: true
        }
        failure {
            script {
                def testReport = sh script: 'tail -n 50 test-results.xml || echo "No test results"', 
                                returnStdout: true
                emailext (
                    subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                    <h2>Build Failed</h2>
                    <p>Render Deploy Hook: ${env.RENDER_DEPLOY_HOOK.replaceAll('.key=.*', '')}</p>
                    <p>Build URL: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    <pre>${testReport}</pre>
                    """,
                    to: env.EMAIL_TO,
                    attachLog: true
                )
            }
        }
        success {
            echo "✅ Successfully deployed to Render!"
            slackSend (
                channel: '#build-notifications',
                color: 'good',
                message: """
                SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}
                Render URL: ${env.RENDER_URL}
                """
            )
        }
    }
}