pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Clone') {
            steps {
                echo 'clonning...'
                checkout scm
            }
        }
        stage('Initialize') {
            steps {
                echo 'initializing...'
                npm install
            }
        }
        stage('Test') {
            steps {
                echo 'testing...'
                npm test
            }
        }
        stage('Deploy') {
            steps {
                echo 'deploying...'
            }
        }
    }
}
