pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                echo 'clonning...'
                checkout scm
            }
        }
        stage('Test') {
            steps {
                echo 'testing...'
            }
        }
        stage('Build') {
            steps {
                echo 'clonning...'
            }
        }
        stage('Deploy') {
            steps {
                echo 'deploying...'
            }
        }
    }
}
