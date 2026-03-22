// Canvas ve İçerek Seçimleri
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
const cards = document.querySelectorAll('.service-card');

// Ayarlar
let particlesArray = [];
const mouse = {
    x: null,
    y: null,
    radius: 120 // Çekim gücü / etki alanı
};

// Ekran boyutunu tam doldur
function setCanvasDimensions() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
    setCanvasDimensions();
    initParticles();
});

setCanvasDimensions();

// Fare hareketlerini global olarak dinle
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;

    // Kartlar üzerinde glow efekti için koordinatları hesapla
    cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        const rect = card.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
    });
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Parçacık Sınıfı
class Particle {
    constructor(x, y, size, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
        // Asıl konumu hatırlat
        this.baseX = x;
        this.baseY = y;
        // Yoğunluk
        this.density = (Math.random() * 30) + 1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        // Ekranın dışına çıkmalarını engelle
        if(this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if(this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        // Rastgele hareket
        this.x += this.speedX;
        this.y += this.speedY;

        // Fare etkileşimi (Parçacıkları kaçır veya çek, biz hafifçe saptıracağız)
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // Etki gücü
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                // Parçacıkları fareden uzağa it
                this.x -= directionX;
                this.y -= directionY;
            }
        }
        this.draw();
    }
}

// Parçacık Sistemini Başlat
function initParticles() {
    particlesArray = [];
    // Ekrana göre parçacık sayısı (Çok abartmamak önemli)
    const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
    
    // Palet (Okyanus / Uzay tonları)
    const colors = [
        'rgba(56, 189, 248, 0.5)',   // sky-400
        'rgba(99, 102, 241, 0.4)',   // indigo-500
        'rgba(167, 139, 250, 0.3)',  // violet-400
        'rgba(255, 255, 255, 0.15)'  // beyazımtırak
    ];

    for (let i = 0; i < particleCount; i++) {
        let size = (Math.random() * 2) + 0.5;
        let x = (Math.random() * (canvas.width - size * 2) + size * 2);
        let y = (Math.random() * (canvas.height - size * 2) + size * 2);
        let speedX = (Math.random() - 0.5) * 0.8;
        let speedY = (Math.random() - 0.5) * 0.8;
        let color = colors[Math.floor(Math.random() * colors.length)];

        particlesArray.push(new Particle(x, y, size, speedX, speedY, color));
    }
}

// Çizgilerle Parçacıkları Birleştir (Takımyıldız etkisi)
function connectParticles() {
    let opacity = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = (dx * dx) + (dy * dy);
            
            // Eğer iki parçacık birbirine yakınsa
            if (distance < (canvas.width / 10) * (canvas.height / 10)) {
                opacity = 1 - (distance / 20000); // Yakınlığa göre belirginlik
                ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.15})`; // Slate-400
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Animasyon Döngüsü
function animateCanvas() {
    requestAnimationFrame(animateCanvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connectParticles();
}

// Çalıştır
initParticles();
animateCanvas();
