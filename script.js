document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const gameOverElement = document.getElementById('gameOver');
    const finalScoreElement = document.getElementById('finalScore');
    
    // Game variables
    const gridSize = 40; // Increased from 20 to 40 to make grid larger
    let tileCountX = 0;
    let tileCountY = 0;
    
    // Set canvas dimensions
    function setCanvasDimensions() {
        const parent = canvas.parentElement;
        canvas.width = parent.offsetWidth - 40;
        canvas.height = parent.offsetHeight - 40;
        
        // Recalculate tile counts
        tileCountX = Math.floor(canvas.width / gridSize);
        tileCountY = Math.floor(canvas.height / gridSize);
    }
    
    // Initialize canvas dimensions
    setCanvasDimensions();
    
    // Update canvas dimensions on window resize
    window.addEventListener('resize', setCanvasDimensions);
    
    // Load coin image
    const coinImage = new Image();
    coinImage.src = 'coin.png';
    
    // Load bomb image
    const bombImage = new Image();
    bombImage.src = 'bomb.png';
    
    let man = {
        x: 10,
        y: 10,
        dx: 0,
        dy: 0,
        trail: [],
        tail: 5
    };
    
    let coins = [];
    let bombs = [];
    let banknotes = [];
    let score = 0;
    let gameRunning = false;
    let timeLeft = 180; // 3 minutes in seconds
    let gameInterval;
    let timerInterval;
    
    // Initialize game
    function init() {
        man = {
            x: 10,
            y: 10,
            dx: 0,
            dy: 0,
            trail: [],
            tail: 5
        };
        
        coins = [];
        bombs = [];
        banknotes = [];
        score = 0;
        timeLeft = 180;
        gameRunning = false;
        
        updateScore();
        updateTimer();
        
        // Generate initial items
        generateCoin();
        generateBomb();
        
        gameOverElement.style.display = 'none';
        startButton.style.display = 'inline-block';
        restartButton.style.display = 'none';
    }
    
    // Start game
    function startGame() {
        if (gameRunning) return;
        
        gameRunning = true;
        startButton.style.display = 'none';
        restartButton.style.display = 'none';
        gameOverElement.style.display = 'none';
        
        // Set initial direction to move right automatically
        if (man.dx === 0 && man.dy === 0) {
            man.dx = 1;
            man.dy = 0;
        }
        
        gameInterval = setInterval(gameLoop, 100);
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    // Game loop
    function gameLoop() {
        if (!gameRunning) return;
        
        // Move man
        man.x += man.dx;
        man.y += man.dy;
        
        // Wrap around edges
        if (man.x < 0) man.x = tileCountX - 1;
        if (man.x >= tileCountX) man.x = 0;
        if (man.y < 0) man.y = tileCountY - 1;
        if (man.y >= tileCountY) man.y = 0;
        
        // Add current position to trail
        man.trail.push({ x: man.x, y: man.y });
        
        // Keep trail at correct length
        while (man.trail.length > man.tail) {
            man.trail.shift();
        }
        
        // Check collisions
        checkCollisions();
        
        // Randomly generate items
        if (Math.random() < 0.05) generateCoin();
        if (Math.random() < 0.02) generateBomb();
        if (Math.random() < 0.005) generateBanknote();
        
        // Draw everything
        draw();
    }
    
    // Draw game
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#e8f5e9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw man trail
        ctx.fillStyle = '#34d399';
        for (let i = 0; i < man.trail.length; i++) {
            ctx.fillRect(man.trail[i].x * gridSize, man.trail[i].y * gridSize, gridSize - 2, gridSize - 2);
        }
        
        // Draw man head
        ctx.fillStyle = '#10b981';
        ctx.fillRect(man.x * gridSize, man.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Draw coins
        for (let i = 0; i < coins.length; i++) {
            ctx.drawImage(
                coinImage,
                coins[i].x * gridSize,
                coins[i].y * gridSize,
                gridSize,
                gridSize
            );
        }
        
        // Draw bombs
        for (let i = 0; i < bombs.length; i++) {
            ctx.drawImage(
                bombImage,
                bombs[i].x * gridSize,
                bombs[i].y * gridSize,
                gridSize,
                gridSize
            );
        }
        
        // Draw banknotes
        ctx.fillStyle = '#8b5cf6';
        for (let i = 0; i < banknotes.length; i++) {
            ctx.fillRect(
                banknotes[i].x * gridSize + 2,
                banknotes[i].y * gridSize + 2,
                gridSize - 4,
                gridSize - 4
            );
        }
    }
    
    // Generate coin
    function generateCoin() {
        const newCoin = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY)
        };
        
        // Make sure coin doesn't spawn on man
        if (newCoin.x === man.x && newCoin.y === man.y) {
            generateCoin();
            return;
        }
        
        coins.push(newCoin);
    }
    
    // Generate bomb
    function generateBomb() {
        const newBomb = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY)
        };
        
        // Make sure bomb doesn't spawn on man
        if (newBomb.x === man.x && newBomb.y === man.y) {
            generateBomb();
            return;
        }
        
        bombs.push(newBomb);
    }
    
    // Generate banknote
    function generateBanknote() {
        const newBanknote = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY)
        };
        
        // Make sure banknote doesn't spawn on man
        if (newBanknote.x === man.x && newBanknote.y === man.y) {
            generateBanknote();
            return;
        }
        
        banknotes.push(newBanknote);
    }
    
    // Check collisions
    function checkCollisions() {
        // Check coin collisions
        for (let i = 0; i < coins.length; i++) {
            if (coins[i].x === man.x && coins[i].y === man.y) {
                coins.splice(i, 1);
                score += 100;
                updateScore();
                man.tail++;
                break;
            }
        }
        
        // Check bomb collisions
        for (let i = 0; i < bombs.length; i++) {
            if (bombs[i].x === man.x && bombs[i].y === man.y) {
                endGame();
                break;
            }
        }
        
        // Check banknote collisions
        for (let i = 0; i < banknotes.length; i++) {
            if (banknotes[i].x === man.x && banknotes[i].y === man.y) {
                banknotes.splice(i, 1);
                score += 1000;
                updateScore();
                break;
            }
        }
        
        // Check self collision
        for (let i = 0; i < man.trail.length - 1; i++) {
            if (man.trail[i].x === man.x && man.trail[i].y === man.y) {
                endGame();
                break;
            }
        }
    }
    
    // Update score display
    function updateScore() {
        scoreElement.textContent = score;
    }
    
    // Update timer
    function updateTimer() {
        if (!gameRunning) return;
        
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }
    
    // End game
    function endGame() {
        gameRunning = false;
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        
        finalScoreElement.textContent = score;
        gameOverElement.style.display = 'block';
        restartButton.style.display = 'inline-block';
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        // Left arrow
        if (e.keyCode === 37 && man.dx === 0) {
            man.dx = -1;
            man.dy = 0;
        }
        // Up arrow
        else if (e.keyCode === 38 && man.dy === 0) {
            man.dx = 0;
            man.dy = -1;
        }
        // Right arrow
        else if (e.keyCode === 39 && man.dx === 0) {
            man.dx = 1;
            man.dy = 0;
        }
        // Down arrow
        else if (e.keyCode === 40 && man.dy === 0) {
            man.dx = 0;
            man.dy = 1;
        }
    });
    
    // Button event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', () => {
        init();
        startGame();
    });
    
    // Initialize game on load
    init();
});