// Machine Learning Interactive Demo JavaScript

class MLDemo {
    constructor() {
        this.currentTab = 'supervised';
        this.charts = {};
        this.data = {
            supervised: { X: [], y: [], X_test: [], y_test: [] },
            unsupervised: { X: [], clusters: [] },
            reinforcement: { grid: [], qTable: {} }
        };
        this.models = {};
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupParameterControls();
        this.setupButtons();
        this.initializeDefaults();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const sections = document.querySelectorAll('.ml-section');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const tabName = btn.getAttribute('data-tab');
                console.log('Tab clicked:', tabName);
                
                // Update active tab button
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active section
                sections.forEach(s => s.classList.remove('active'));
                const targetSection = document.getElementById(tabName);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                this.currentTab = tabName;
                
                // Re-initialize grid for RL tab
                if (tabName === 'reinforcement') {
                    setTimeout(() => this.createRLGrid(), 100);
                }
            });
        });
    }

    setupParameterControls() {
        // Supervised Learning Controls
        this.setupRangeControl('sup-dataset-size', 'sup-size-value');
        this.setupRangeControl('sup-features', 'sup-features-value');
        this.setupRangeControl('sup-split', 'sup-split-value');

        // Unsupervised Learning Controls
        this.setupRangeControl('unsup-dataset-size', 'unsup-size-value');
        this.setupRangeControl('unsup-clusters', 'unsup-clusters-value');
        this.setupRangeControl('unsup-std', 'unsup-std-value');

        // Reinforcement Learning Controls
        this.setupRangeControl('rl-grid-size', 'rl-grid-value', (val) => `${val}x${val}`);
        this.setupRangeControl('rl-learning-rate', 'rl-lr-value');
        this.setupRangeControl('rl-epsilon', 'rl-epsilon-value');
        this.setupRangeControl('rl-episodes', 'rl-episodes-value');
        this.setupRangeControl('rl-discount', 'rl-discount-value');

        // Add grid size change listener
        const gridSizeInput = document.getElementById('rl-grid-size');
        if (gridSizeInput) {
            gridSizeInput.addEventListener('input', () => {
                setTimeout(() => this.createRLGrid(), 100);
            });
        }
    }

    setupRangeControl(inputId, displayId, formatter = null) {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        
        if (input && display) {
            // Set initial value
            const initialValue = parseFloat(input.value);
            display.textContent = formatter ? formatter(initialValue) : initialValue;
            
            // Add event listeners for both input and change events
            ['input', 'change'].forEach(eventType => {
                input.addEventListener(eventType, (e) => {
                    const value = parseFloat(e.target.value);
                    display.textContent = formatter ? formatter(value) : value;
                });
            });
        }
    }

    setupButtons() {
        // Supervised Learning Buttons
        const supGenerateBtn = document.getElementById('sup-generate-data');
        const supTrainBtn = document.getElementById('sup-train-model');
        
        if (supGenerateBtn) {
            supGenerateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateSupervisedData();
            });
        }
        
        if (supTrainBtn) {
            supTrainBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.trainSupervisedModel();
            });
        }

        // Unsupervised Learning Buttons
        const unsupGenerateBtn = document.getElementById('unsup-generate-data');
        const unsupClusterBtn = document.getElementById('unsup-run-clustering');
        
        if (unsupGenerateBtn) {
            unsupGenerateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateUnsupervisedData();
            });
        }
        
        if (unsupClusterBtn) {
            unsupClusterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.runClustering();
            });
        }

        // Reinforcement Learning Buttons
        const rlTrainBtn = document.getElementById('rl-start-training');
        const rlTestBtn = document.getElementById('rl-test-agent');
        
        if (rlTrainBtn) {
            rlTrainBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startRLTraining();
            });
        }
        
        if (rlTestBtn) {
            rlTestBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.testRLAgent();
            });
        }
    }

    initializeDefaults() {
        // Generate initial data for all sections
        this.generateSupervisedData();
        this.generateUnsupervisedData();
        
        // Initialize grid after a short delay
        setTimeout(() => {
            this.createRLGrid();
        }, 100);
    }

    // ===== SUPERVISED LEARNING =====
    generateSupervisedData() {
        const size = parseInt(document.getElementById('sup-dataset-size').value);
        const features = parseInt(document.getElementById('sup-features').value);
        const split = parseFloat(document.getElementById('sup-split').value);
        
        // Generate synthetic classification data
        const X = [];
        const y = [];
        
        for (let i = 0; i < size; i++) {
            const point = [];
            for (let j = 0; j < features; j++) {
                point.push(Math.random() * 10 - 5);
            }
            
            // Simple classification rule based on sum of features
            const sum = point.reduce((a, b) => a + b, 0);
            y.push(sum > 0 ? 1 : 0);
            X.push(point);
        }
        
        // Split data
        const trainSize = Math.floor(size * split);
        this.data.supervised = {
            X: X.slice(0, trainSize),
            y: y.slice(0, trainSize),
            X_test: X.slice(trainSize),
            y_test: y.slice(trainSize)
        };
        
        this.showMessage('Data generated successfully!', 'success');
    }

    async trainSupervisedModel() {
        const algorithm = document.getElementById('sup-algorithm').value;
        const progressContainer = document.getElementById('sup-progress');
        const progressFill = document.getElementById('sup-progress-fill');
        
        if (progressContainer) progressContainer.classList.remove('hidden');
        if (progressFill) progressFill.style.width = '0%';
        
        // Simulate training progress
        for (let i = 0; i <= 100; i += 10) {
            if (progressFill) progressFill.style.width = `${i}%`;
            await this.delay(50);
        }
        
        // Train model based on algorithm
        let trainAcc, testAcc;
        
        switch (algorithm) {
            case 'logistic':
                ({ trainAcc, testAcc } = this.trainLogisticRegression());
                break;
            case 'forest':
                ({ trainAcc, testAcc } = this.trainRandomForest());
                break;
            case 'svm':
                ({ trainAcc, testAcc } = this.trainSVM());
                break;
            default:
                trainAcc = 0.85;
                testAcc = 0.82;
        }
        
        // Update metrics
        this.updateMetric('sup-train-accuracy', `${(trainAcc * 100).toFixed(1)}%`, trainAcc);
        this.updateMetric('sup-test-accuracy', `${(testAcc * 100).toFixed(1)}%`, testAcc);
        
        // Create confusion matrix visualization
        this.createConfusionMatrix();
        
        if (progressContainer) progressContainer.classList.add('hidden');
        this.showMessage('Model trained successfully!', 'success');
    }

    trainLogisticRegression() {
        const { X, y, X_test, y_test } = this.data.supervised;
        
        if (!X.length || !y.length) {
            return { trainAcc: 0.85, testAcc: 0.82 };
        }
        
        // Simplified logistic regression simulation
        const trainAcc = 0.80 + Math.random() * 0.15;
        const testAcc = trainAcc - 0.02 - Math.random() * 0.08;
        
        return { trainAcc: Math.max(0.5, trainAcc), testAcc: Math.max(0.5, testAcc) };
    }

    trainRandomForest() {
        const baseAcc = 0.75 + Math.random() * 0.2;
        return {
            trainAcc: Math.min(baseAcc + 0.05, 0.98),
            testAcc: Math.max(0.6, baseAcc)
        };
    }

    trainSVM() {
        const baseAcc = 0.7 + Math.random() * 0.25;
        return {
            trainAcc: Math.min(baseAcc + 0.03, 0.96),
            testAcc: Math.max(0.55, baseAcc)
        };
    }

    createConfusionMatrix() {
        const ctx = document.getElementById('sup-confusion-matrix');
        if (!ctx) return;
        
        if (this.charts.confusionMatrix) {
            this.charts.confusionMatrix.destroy();
        }
        
        // Generate fake confusion matrix data
        const tp = Math.floor(Math.random() * 50) + 40;
        const fp = Math.floor(Math.random() * 20) + 5;
        const fn = Math.floor(Math.random() * 20) + 5;
        const tn = Math.floor(Math.random() * 50) + 40;
        
        this.charts.confusionMatrix = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['True Positive', 'False Positive', 'False Negative', 'True Negative'],
                datasets: [{
                    label: 'Count',
                    data: [tp, fp, fn, tn],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Confusion Matrix'
                    }
                }
            }
        });
    }

    // ===== UNSUPERVISED LEARNING =====
    generateUnsupervisedData() {
        const size = parseInt(document.getElementById('unsup-dataset-size').value);
        const nClusters = parseInt(document.getElementById('unsup-clusters').value);
        const std = parseFloat(document.getElementById('unsup-std').value);
        
        const X = [];
        const centers = [];
        
        // Generate cluster centers
        for (let i = 0; i < nClusters; i++) {
            centers.push([
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ]);
        }
        
        // Generate data points around centers
        for (let i = 0; i < size; i++) {
            const cluster = Math.floor(Math.random() * nClusters);
            const center = centers[cluster];
            
            X.push([
                center[0] + (Math.random() - 0.5) * std * 2,
                center[1] + (Math.random() - 0.5) * std * 2
            ]);
        }
        
        this.data.unsupervised.X = X;
        this.showMessage('Unsupervised data generated!', 'success');
    }

    async runClustering() {
        const algorithm = document.getElementById('unsup-algorithm').value;
        const progressContainer = document.getElementById('unsup-progress');
        const progressFill = document.getElementById('unsup-progress-fill');
        
        if (progressContainer) progressContainer.classList.remove('hidden');
        if (progressFill) progressFill.style.width = '0%';
        
        // Simulate clustering progress
        for (let i = 0; i <= 100; i += 15) {
            if (progressFill) progressFill.style.width = `${i}%`;
            await this.delay(100);
        }
        
        let clusters, silhouette;
        
        if (algorithm === 'kmeans') {
            ({ clusters, silhouette } = this.runKMeans());
        } else {
            ({ clusters, silhouette } = this.runDBSCAN());
        }
        
        this.data.unsupervised.clusters = clusters;
        
        // Update metrics
        const uniqueClusters = new Set(clusters).size;
        this.updateMetric('unsup-silhouette', silhouette.toFixed(3), silhouette);
        this.updateMetric('unsup-clusters-found', uniqueClusters, uniqueClusters / 8);
        
        // Create cluster visualization
        this.createClusterChart();
        
        if (progressContainer) progressContainer.classList.add('hidden');
        this.showMessage('Clustering completed!', 'success');
    }

    runKMeans() {
        const { X } = this.data.unsupervised;
        const k = parseInt(document.getElementById('unsup-clusters').value);
        
        if (!X.length) {
            return { clusters: [], silhouette: 0.5 };
        }
        
        const clusters = X.map(() => Math.floor(Math.random() * k));
        const silhouette = 0.3 + Math.random() * 0.5;
        
        return { clusters, silhouette };
    }

    runDBSCAN() {
        const { X } = this.data.unsupervised;
        
        if (!X.length) {
            return { clusters: [], silhouette: 0.4 };
        }
        
        const nClusters = 2 + Math.floor(Math.random() * 4);
        const clusters = X.map(() => Math.floor(Math.random() * nClusters));
        const silhouette = 0.2 + Math.random() * 0.6;
        
        return { clusters, silhouette };
    }

    createClusterChart() {
        const ctx = document.getElementById('unsup-cluster-chart');
        if (!ctx) return;
        
        if (this.charts.clusters) {
            this.charts.clusters.destroy();
        }
        
        const { X, clusters } = this.data.unsupervised;
        
        if (!X.length || !clusters.length) {
            return;
        }
        
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'];
        
        const datasets = [];
        const uniqueClusters = [...new Set(clusters)];
        
        uniqueClusters.forEach((cluster, i) => {
            const clusterPoints = X.filter((_, idx) => clusters[idx] === cluster);
            datasets.push({
                label: `Cluster ${cluster}`,
                data: clusterPoints.map(point => ({ x: point[0], y: point[1] })),
                backgroundColor: colors[i % colors.length],
                pointRadius: 5
            });
        });
        
        this.charts.clusters = new Chart(ctx, {
            type: 'scatter',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cluster Visualization'
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Feature 1' } },
                    y: { title: { display: true, text: 'Feature 2' } }
                }
            }
        });
    }

    // ===== REINFORCEMENT LEARNING =====
    createRLGrid() {
        const gridSize = parseInt(document.getElementById('rl-grid-size').value);
        const container = document.getElementById('rl-grid-container');
        
        if (!container) return;
        
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        this.data.reinforcement.grid = [];
        
        for (let i = 0; i < gridSize; i++) {
            const row = [];
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                
                // Set special cells
                if (i === 0 && j === 0) {
                    cell.classList.add('start');
                    cell.textContent = 'S';
                } else if (i === gridSize - 1 && j === gridSize - 1) {
                    cell.classList.add('goal');
                    cell.textContent = 'G';
                } else if (Math.random() < 0.15) {
                    cell.classList.add('obstacle');
                    cell.textContent = 'X';
                }
                
                container.appendChild(cell);
                row.push(cell.classList.contains('obstacle') ? -1 : 0);
            }
            this.data.reinforcement.grid.push(row);
        }
        
        // Mark goal
        this.data.reinforcement.grid[gridSize - 1][gridSize - 1] = 1;
    }

    async startRLTraining() {
        const episodes = parseInt(document.getElementById('rl-episodes').value);
        const progressContainer = document.getElementById('rl-progress');
        const progressFill = document.getElementById('rl-progress-fill');
        
        if (progressContainer) progressContainer.classList.remove('hidden');
        
        const rewards = [];
        let totalReward = 0;
        let successCount = 0;
        
        // Simulate training episodes
        for (let episode = 0; episode < episodes; episode++) {
            const reward = this.runEpisode();
            rewards.push(reward);
            totalReward += reward;
            
            if (reward > 0) successCount++;
            
            if (episode % Math.max(1, Math.floor(episodes / 100)) === 0) {
                if (progressFill) progressFill.style.width = `${(episode / episodes) * 100}%`;
                await this.delay(10);
            }
        }
        
        // Update metrics
        const avgReward = totalReward / episodes;
        const successRate = (successCount / episodes) * 100;
        
        this.updateMetric('rl-avg-reward', avgReward.toFixed(2), (avgReward + 5) / 15);
        this.updateMetric('rl-success-rate', `${successRate.toFixed(1)}%`, successRate / 100);
        
        // Create progress chart
        this.createRLProgressChart(rewards);
        
        if (progressContainer) progressContainer.classList.add('hidden');
        this.showMessage('RL training completed!', 'success');
    }

    runEpisode() {
        const success = Math.random() > 0.3;
        return success ? Math.random() * 10 : -Math.random() * 5;
    }

    createRLProgressChart(rewards) {
        const ctx = document.getElementById('rl-progress-chart');
        if (!ctx) return;
        
        if (this.charts.rlProgress) {
            this.charts.rlProgress.destroy();
        }
        
        // Show moving average of rewards
        const windowSize = Math.max(10, Math.floor(rewards.length / 50));
        const movingAvg = [];
        
        for (let i = 0; i < rewards.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const window = rewards.slice(start, i + 1);
            const avg = window.reduce((a, b) => a + b, 0) / window.length;
            movingAvg.push(avg);
        }
        
        this.charts.rlProgress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: rewards.length }, (_, i) => i + 1),
                datasets: [{
                    label: 'Average Reward',
                    data: movingAvg,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Training Progress'
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Episode' } },
                    y: { title: { display: true, text: 'Reward' } }
                }
            }
        });
    }

    async testRLAgent() {
        const gridSize = parseInt(document.getElementById('rl-grid-size').value);
        const cells = document.querySelectorAll('.grid-cell');
        
        if (!cells.length) return;
        
        // Clear previous path
        cells.forEach(cell => {
            cell.classList.remove('agent', 'path');
        });
        
        // Simulate agent movement
        let row = 0, col = 0;
        const path = [[row, col]];
        
        while (row < gridSize - 1 || col < gridSize - 1) {
            // Simple policy: move towards goal
            if (Math.random() > 0.3) {
                if (row < gridSize - 1) row++;
                else if (col < gridSize - 1) col++;
            } else {
                if (col < gridSize - 1) col++;
                else if (row < gridSize - 1) row++;
            }
            
            path.push([row, col]);
            
            if (path.length > gridSize * 2) break;
        }
        
        // Animate path
        for (let i = 0; i < path.length; i++) {
            const [r, c] = path[i];
            const cellIndex = r * gridSize + c;
            const cell = cells[cellIndex];
            
            if (cell && !cell.classList.contains('obstacle')) {
                // Remove agent from previous position
                cells.forEach(c => c.classList.remove('agent'));
                
                // Add agent to current position
                cell.classList.add('agent');
                
                // Mark path
                if (i > 0) {
                    const [prevR, prevC] = path[i - 1];
                    const prevIndex = prevR * gridSize + prevC;
                    const prevCell = cells[prevIndex];
                    if (prevCell && !prevCell.classList.contains('start')) {
                        prevCell.classList.add('path');
                    }
                }
                
                await this.delay(500);
            }
        }
        
        this.showMessage('Agent test completed!', 'success');
    }

    // ===== UTILITY METHODS =====
    updateMetric(elementId, text, value) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = text;
        this.colorMetric(elementId, value);
    }

    colorMetric(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.remove('good', 'medium', 'poor');
        
        if (value >= 0.8) element.classList.add('good');
        else if (value >= 0.6) element.classList.add('medium');
        else element.classList.add('poor');
    }

    showMessage(message, type) {
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the ML Demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        new MLDemo();
        console.log('🤖 Machine Learning Interactive Demo loaded successfully!');
    } catch (error) {
        console.error('Error initializing ML Demo:', error);
    }
});