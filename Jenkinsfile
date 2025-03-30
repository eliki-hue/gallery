pipeline {
    agent any

    environment {
        // Render deployment URL (replace with your actual Render URL)
        RENDER_URL = 'https://gallery-1uvx.onrender.com'
        // Slack channel name (replace with your channel)
        SLACK_CHANNEL = '#yourname_IP1'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing required dependencies...'
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    echo 'Building the application...'
                    // Additional build steps if needed
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    echo 'Running tests...'
                    try {
                        sh 'npm test'
                    } catch (err) {
                        // Send email on test failure
                        emailext (
                            subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                            body: """<p>Test failed in build ${env.BUILD_NUMBER}:</p>
                                    <p>Check console output at <a href="${env.BUILD_URL}">${env.JOB_NAME} [${env.BUILD_NUMBER}]</a></p>""",
                            to: 'your-email@example.com',  // Replace with your email
                            recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                        )
                        currentBuild.result = 'FAILURE'
                        error('Tests failed')
                    }
                }
            }
        }

        stage('Deploy to Render') {
            steps {
                script {
                    echo 'Deploying to Render...'
                    sh 'node server.js &'  // Start the server for Render
                }
            }
        }
    }

    post {
        success {
            script {
                echo 'Pipeline succeeded! Sending Slack notification...'
                slackSend (
                    channel: env.SLACK_CHANNEL,
                    color: 'good',
                    message: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'\n" +
                             "Build URL: ${env.BUILD_URL}\n" +
                             "Render URL: ${env.RENDER_URL}"
                )
            }
        }
        failure {
            script {
                echo 'Pipeline failed! Sending Slack notification...'
                slackSend (
                    channel: env.SLACK_CHANNEL,
                    color: 'danger',
                    message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'\n" +
                             "Build URL: ${env.BUILD_URL}\n" +
                             "Check the console output for details"
                )
            }
        }
    }
}