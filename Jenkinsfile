pipeline {
    agent any

    environment {
        MONGO_URI_PROD = credentials('MONGO_URI_PROD')
        MONGO_URI_DEV = credentials('MONGO_URI_DEV')
        MONGO_URI_TEST = credentials('MONGO_URI_TEST')
        RENDER_URL = 'https://gallery-1uvx.onrender.com'
        NPM_CONFIG_LOGLEVEL = 'info'
        EMAIL_TO = 'elijah.kiragu2@student.moringaschool.com'
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
                        url: 'https://github.com/eliki-hue/gallery.git'
                    ]],
                    extensions: [[
                        $class: 'CleanBeforeCheckout'
                    ]]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                    rm -f package-lock.json
                    npm cache clean --force
                    npm install mocha@10.2.0 --save-dev --registry=https://registry.npmjs.org
                    npm install chai@4.3.7 --save-dev --registry=https://registry.npmjs.org
                    npm install
                    '''
                }
            }
        }

        stage('Verify Installation') {
            steps {
                sh '''
                    echo "Node version: $(node --version)"
                    echo "NPM version: $(npm --version)"
                    npm list mocha chai --depth=0
                '''
            }
        }

        stage('Build') {
            steps {
                sh 'echo "No build script found"'
            }
        }

        stage('Test') {
            steps {
                script {
                    try {
                        sh 'npx mocha --exit --timeout 10000 test/*.js'
                    } catch (err) {
                        emailext (
                            subject: "FAILED: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}",
                            body: """
                                <h2>Test Failure Notification</h2>
                                <p>Job: <b>${env.JOB_NAME}</b></p>
                                <p>Build Number: <b>#${env.BUILD_NUMBER}</b></p>
                                <p>Failed Stage: <b>Test</b></p>
                                <p>Console Output: <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>
                                <p>Build URL: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            """,
                            to: env.EMAIL_TO,
                            recipientProviders: [
                                [$class: 'DevelopersRecipientProvider'],
                                [$class: 'RequesterRecipientProvider']
                            ],
                            attachLog: true,
                            compressLog: true
                        )
                        currentBuild.result = 'FAILURE'
                        error("Tests failed - notification sent to ${env.EMAIL_TO}")
                    }
                }
            }
        }

        stage('Deploy to Render') {
            steps {
                sh 'node server.js &'
                sh 'sleep 15'
                sh "curl -Is ${env.RENDER_URL} | head -n 1"
            }
        }
    }

    post {
        always {
            script {
                node {
                    sh 'pkill -f "node server.js" || echo "No node process to kill"'
                }

                slackSend (
                channel: 'elijah_IP1',
                color: 'danger',
                message: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${env.BUILD_URL}\n${env.RENDER_URL}"
            )
            }
        }
        failure {
            
            slackSend (
                channel: 'elijah_IP1',
                color: 'danger',
                message: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
            )
            
        }
    }
}