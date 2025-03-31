pipeline {
    agent any

    environment {
        RENDER_URL = 'https://gallery-1uvx.onrender.com'
        NPM_CONFIG_LOGLEVEL = 'info' // Better logging
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
                    // Install using exact versions and explicit registry
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
                 echo "No build script found"
            }
        }
        stage('Test') {
            steps {
                sh 'npx mocha --exit --timeout 10000 test/*.js'
            }
        }

        stage('Deploy to Render') {
            steps {
                sh 'node server.js &'
                sh 'sleep 15' // Allow server to start
                sh "curl -Is ${env.RENDER_URL} | head -n 1"
            }
        }
    }
    post {
        always {
            sh 'pkill -f "node server.js" || echo "No node process to kill"'
        }
        failure {
            slackSend (
                channel: '#yourname_IP1',
                color: 'danger',
                message: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
            )
        }
    }
}