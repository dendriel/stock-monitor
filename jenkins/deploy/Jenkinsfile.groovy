pipeline {
    agent any
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
                npm init
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
