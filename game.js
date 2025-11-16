// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game constants
const GRAVITY = 0.3;
const BALL_RADIUS = 8;
const PEG_RADIUS = 5;
const BOUNCE_FACTOR = 0.7;
const HORIZONTAL_DAMPING = 0.98;

// Game state
let balls = [];
let pegs = [];
let containers = [];
let totalScore = 0;
let ballsDropped = 0;

// Container configuration (point values)
const CONTAINER_CONFIG = [
    { points: 100, color: '#ff6b6b' },
    { points: 50, color: '#feca57' },
    { points: 20, color: '#48dbfb' },
    { points: 10, color: '#1dd1a1' },
    { points: 5, color: '#54a0ff' },
    { points: 10, color: '#1dd1a1' },
    { points: 20, color: '#48dbfb' },
    { points: 50, color: '#feca57' },
    { points: 100, color: '#ff6b6b' }
];

// Ball class
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = 0;
        this.radius = BALL_RADIUS;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.isActive = true;
        this.hasScored = false;
    }

    update() {
        // Apply gravity
        this.vy += GRAVITY;

        // Apply horizontal damping
        this.vx *= HORIZONTAL_DAMPING;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Wall collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx) * BOUNCE_FACTOR;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -Math.abs(this.vx) * BOUNCE_FACTOR;
        }

        // Check collision with pegs
        this.checkPegCollision();

        // Check if ball reached a container
        this.checkContainerCollision();

        // Remove ball if it's way off screen
        if (this.y > canvas.height + 100) {
            this.isActive = false;
        }
    }

    checkPegCollision() {
        for (let peg of pegs) {
            const dx = this.x - peg.x;
            const dy = this.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + peg.radius) {
                // Collision detected
                const angle = Math.atan2(dy, dx);
                const targetX = peg.x + Math.cos(angle) * (this.radius + peg.radius);
                const targetY = peg.y + Math.sin(angle) * (this.radius + peg.radius);

                // Move ball outside the peg
                this.x = targetX;
                this.y = targetY;

                // Reflect velocity
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                this.vx = Math.cos(angle) * speed * BOUNCE_FACTOR;
                this.vy = Math.sin(angle) * speed * BOUNCE_FACTOR;

                // Add some randomness for more interesting gameplay
                this.vx += (Math.random() - 0.5) * 2;

                // Visual feedback
                peg.hit();
            }
        }
    }

    checkContainerCollision() {
        if (this.hasScored) return;

        for (let container of containers) {
            if (this.y + this.radius >= container.y &&
                this.x >= container.x &&
                this.x <= container.x + container.width) {

                // Ball landed in container
                this.hasScored = true;
                this.vy = 0;
                this.vx = 0;

                // Add score
                totalScore += container.points;
                updateScore();

                // Visual feedback
                container.flash();

                // Remove ball after a delay
                setTimeout(() => {
                    this.isActive = false;
                }, 1000);

                break;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}

// Peg class
class Peg {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = PEG_RADIUS;
        this.baseColor = '#ff6348';
        this.currentColor = this.baseColor;
        this.hitTime = 0;
    }

    hit() {
        this.hitTime = Date.now();
    }

    draw() {
        // Fade effect when hit
        const timeSinceHit = Date.now() - this.hitTime;
        const glowIntensity = Math.max(0, 1 - timeSinceHit / 200);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (glowIntensity > 0) {
            // Draw glow
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
            gradient.addColorStop(0, `rgba(255, 255, 100, ${glowIntensity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x - this.radius * 3, this.y - this.radius * 3, this.radius * 6, this.radius * 6);
        }

        ctx.fillStyle = glowIntensity > 0 ? '#ffeb3b' : this.baseColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }
}

// Container class
class Container {
    constructor(x, y, width, height, points, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.points = points;
        this.color = color;
        this.flashTime = 0;
    }

    flash() {
        this.flashTime = Date.now();
    }

    draw() {
        const timeSinceFlash = Date.now() - this.flashTime;
        const flashIntensity = Math.max(0, 1 - timeSinceFlash / 300);

        // Draw container
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw flash effect
        if (flashIntensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.5})`;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Draw points text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.points, this.x + this.width / 2, this.y + this.height / 2);
    }
}

// Initialize game
function initGame() {
    // Create pegs in a triangular pattern
    const pegRows = 10;
    const pegSpacing = 60;
    const startY = 80;
    const startX = canvas.width / 2;

    pegs = [];
    for (let row = 0; row < pegRows; row++) {
        const pegsInRow = row + 3;
        const rowWidth = (pegsInRow - 1) * pegSpacing;
        const rowStartX = startX - rowWidth / 2;

        for (let col = 0; col < pegsInRow; col++) {
            const x = rowStartX + col * pegSpacing;
            const y = startY + row * pegSpacing;
            pegs.push(new Peg(x, y));
        }
    }

    // Create containers at the bottom
    const containerCount = CONTAINER_CONFIG.length;
    const containerWidth = canvas.width / containerCount;
    const containerHeight = 60;
    const containerY = canvas.height - containerHeight;

    containers = [];
    for (let i = 0; i < containerCount; i++) {
        containers.push(new Container(
            i * containerWidth,
            containerY,
            containerWidth,
            containerHeight,
            CONTAINER_CONFIG[i].points,
            CONTAINER_CONFIG[i].color
        ));
    }
}

// Drop a ball
function dropBall() {
    const x = canvas.width / 2 + (Math.random() - 0.5) * 50;
    const y = 20;
    balls.push(new Ball(x, y));
    ballsDropped++;
    updateScore();
}

// Drop multiple balls
function dropMultipleBalls(count) {
    let dropped = 0;
    const interval = setInterval(() => {
        dropBall();
        dropped++;
        if (dropped >= count) {
            clearInterval(interval);
        }
    }, 200);
}

// Update score display
function updateScore() {
    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('ballsDropped').textContent = ballsDropped;
}

// Reset game
function resetGame() {
    balls = [];
    totalScore = 0;
    ballsDropped = 0;
    updateScore();
    initGame();
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw containers
    for (let container of containers) {
        container.draw();
    }

    // Draw pegs
    for (let peg of pegs) {
        peg.draw();
    }

    // Update and draw balls
    balls = balls.filter(ball => ball.isActive);
    for (let ball of balls) {
        ball.update();
        ball.draw();
    }

    requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('dropBall').addEventListener('click', () => {
    dropBall();
});

document.getElementById('dropMultiple').addEventListener('click', () => {
    dropMultipleBalls(5);
});

document.getElementById('resetGame').addEventListener('click', () => {
    resetGame();
});

// Start game
initGame();
updateScore();
gameLoop();
