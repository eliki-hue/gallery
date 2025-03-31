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
                try {
                        sh '''
                            echo "=== Running Tests ==="
                            npm test
                        '''
                    } catch (Exception e) {
                        currentBuild.result = 'FAILURE'
                        echo "❌ Tests failed!"
                        
                        // Send email on test failure
                        mail to: ${env.EMAIL_TO},
                             subject: "❌ Test Failure: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                             body: "The test stage failed. \n\nCheck the logs here: ${env.BUILD_URL}"
                        
                        throw e  // Ensure pipeline stops on failure
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
