pipeline {
    agent any

    environment {
        RENDER_URL = 'https://gallery-1uvx.onrender.com'
        RENDER_DEPLOY_HOOK = "${RENDER_DEPLOY_HOOK}"  // Use environment variable
        NPM_CONFIG_LOGLEVEL = 'info'
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

        stage('Trigger Render Deploy') {
            steps {
                script {
                    echo "Triggering Render deployment..."
                    def response = httpRequest '${RENDER_DEPLOY_HOOK}'
                    echo "Response: ${response.content}"
                }
            }
        }
    }

    post {
        success {
            echo "✅ Successfully deployed to Render!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}
