// DOM Elementleri
const match = document.getElementById('match');
const matchbox = document.querySelector('.matchbox');
const paper = document.getElementById('paper');
const paperGrid = document.getElementById('paperGrid');
const burnEffect = document.getElementById('burnEffect');
const backgroundPhoto = document.getElementById('backgroundPhoto');
const photoImage = document.getElementById('photoImage');
const sparksContainer = document.getElementById('sparksContainer');
const noteCards = document.querySelectorAll('.note-card');

// Kağıt parçaları - Çok fazla parça
const GRID_COLS = 40;
const GRID_ROWS = 40;
let paperPieces = [];

// Durumlar
let isDragging = false;
let isBurning = false;
let isPaperBurning = false;
let matchPosition = { x: 0, y: 0 };
let startPosition = { x: 0, y: 0 };
let lastStrikerPosition = null;
let totalStrikeDistance = 0;
const REQUIRED_STRIKE_DISTANCE = 45;

// Kibrit pozisyonunu ayarla
function setMatchPosition(x, y) {
    match.style.left = x + 'px';
    match.style.bottom = y + 'px';
    matchPosition.x = x;
    matchPosition.y = y;
}

// İlk pozisyon
setMatchPosition(70, 105);

// Mouse olayları
match.addEventListener('mousedown', (e) => {
    isDragging = true;
    match.style.cursor = 'grabbing';
    startPosition.x = e.clientX;
    startPosition.y = e.clientY;
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPosition.x;
    const deltaY = startPosition.y - e.clientY;
    
    const newX = matchPosition.x + deltaX;
    const newY = matchPosition.y + deltaY;
    
    setMatchPosition(newX, newY);
    
    startPosition.x = e.clientX;
    startPosition.y = e.clientY;
    
    checkMatchboxProximity();
    
    if (isBurning) {
        checkPaperProximity();
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        match.style.cursor = 'grab';
        if (!isBurning) {
            lastStrikerPosition = null;
            totalStrikeDistance = 0;
        }
    }
});

// Touch olayları
match.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    startPosition.x = touch.clientX;
    startPosition.y = touch.clientY;
    e.preventDefault();
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosition.x;
    const deltaY = startPosition.y - touch.clientY;
    
    const newX = matchPosition.x + deltaX;
    const newY = matchPosition.y + deltaY;
    
    setMatchPosition(newX, newY);
    
    startPosition.x = touch.clientX;
    startPosition.y = touch.clientY;
    
    checkMatchboxProximity();
    
    if (isBurning) {
        checkPaperProximity();
    }
    
    e.preventDefault();
});

document.addEventListener('touchend', () => {
    if (isDragging) {
        isDragging = false;
        if (!isBurning) {
            lastStrikerPosition = null;
            totalStrikeDistance = 0;
        }
    }
});

// Kıvılcım oluştur
function createSpark(x, y) {
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 30;
    const endDistance = distance * 1.6;
    
    const sparkX = Math.cos(angle) * distance;
    const sparkY = Math.sin(angle) * distance;
    const sparkXEnd = Math.cos(angle) * endDistance;
    const sparkYEnd = Math.sin(angle) * endDistance;
    
    spark.style.setProperty('--spark-x', sparkX + 'px');
    spark.style.setProperty('--spark-y', sparkY + 'px');
    spark.style.setProperty('--spark-x-end', sparkXEnd + 'px');
    spark.style.setProperty('--spark-y-end', sparkYEnd + 'px');
    
    sparksContainer.appendChild(spark);
    
    setTimeout(() => {
        if (spark.parentNode) {
            spark.parentNode.removeChild(spark);
        }
    }, 700);
}

// Kibrit kutusuna yakınlık kontrolü
function checkMatchboxProximity() {
    const matchboxRect = matchbox.getBoundingClientRect();
    const matchRect = match.getBoundingClientRect();
    
    const matchHeadX = matchRect.left + matchRect.width / 2;
    const matchHeadY = matchRect.top;
    
    const strikerRect = matchbox.getBoundingClientRect();
    const strikerTop = strikerRect.bottom - 36;
    const strikerBottom = strikerRect.bottom - 8;
    const strikerLeft = strikerRect.left + 12;
    const strikerRight = strikerRect.right - 12;
    
    const isHeadInStrikerArea = 
        matchHeadX >= strikerLeft && 
        matchHeadX <= strikerRight &&
        matchHeadY >= strikerTop && 
        matchHeadY <= strikerBottom;
    
    if (isHeadInStrikerArea && isDragging) {
        if (lastStrikerPosition) {
            const distance = Math.sqrt(
                Math.pow(matchHeadX - lastStrikerPosition.x, 2) + 
                Math.pow(matchHeadY - lastStrikerPosition.y, 2)
            );
            totalStrikeDistance += distance;
            
            if (Math.random() > 0.7) {
                createSpark(matchHeadX, matchHeadY);
            }
        }
        
        lastStrikerPosition = { x: matchHeadX, y: matchHeadY };
        
        if (!isBurning && totalStrikeDistance >= REQUIRED_STRIKE_DISTANCE) {
            lightMatch();
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    createSpark(matchHeadX, matchHeadY);
                }, i * 50);
            }
        }
    } else {
        if (!isHeadInStrikerArea) {
            lastStrikerPosition = null;
            totalStrikeDistance = 0;
        }
    }
}

// Kibriti yak
function lightMatch() {
    isBurning = true;
    match.classList.add('burning');
}

// Kağıda yakınlık kontrolü
function checkPaperProximity() {
    if (isPaperBurning) return;
    
    const paperRect = paper.getBoundingClientRect();
    const matchRect = match.getBoundingClientRect();
    
    const matchHeadX = matchRect.left + matchRect.width / 2;
    const matchHeadY = matchRect.top;
    
    // Kağıdın sınırları içinde mi kontrol et
    const isMatchHeadOnPaper = 
        matchHeadX >= paperRect.left && 
        matchHeadX <= paperRect.right &&
        matchHeadY >= paperRect.top && 
        matchHeadY <= paperRect.bottom;
    
    if (isMatchHeadOnPaper && isBurning) {
        // Dokunma noktasını hesapla (kağıdın içindeki göreceli pozisyon)
        const touchX = matchHeadX - paperRect.left;
        const touchY = matchHeadY - paperRect.top;
        
        burnPaper(touchX, touchY);
    }
}

// Kağıt parçalarını oluştur
function createPaperPieces() {
    const paperWidth = 400;
    const paperHeight = 400;
    const pieceWidth = paperWidth / GRID_COLS;
    const pieceHeight = paperHeight / GRID_ROWS;
    
    paperPieces = [];
    
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const piece = document.createElement('div');
            piece.className = 'paper-piece';
            piece.style.width = pieceWidth + 'px';
            piece.style.height = pieceHeight + 'px';
            piece.style.left = (col * pieceWidth) + 'px';
            piece.style.top = (row * pieceHeight) + 'px';
            piece.style.margin = '0';
            piece.style.padding = '0';
            piece.style.border = 'none';
            
            const pieceData = {
                element: piece,
                row: row,
                col: col,
                x: col * pieceWidth + pieceWidth / 2,
                y: row * pieceHeight + pieceHeight / 2,
                burned: false
            };
            
            paperPieces.push(pieceData);
            paperGrid.appendChild(piece);
        }
    }
}

// Kağıdı yak - dokunma noktasından başla
function burnPaper(touchX, touchY) {
    if (isPaperBurning) return;
    
    isPaperBurning = true;
    
    // Dokunma noktasını CSS değişkeni olarak ayarla
    const burnOrigin = document.getElementById('burnOrigin');
    burnOrigin.style.left = touchX + 'px';
    burnOrigin.style.top = touchY + 'px';
    
    // Hangi parçaya dokunulduğunu bul
    const touchedPiece = paperPieces.find(piece => {
        const pieceRect = {
            left: piece.x - (400 / GRID_COLS) / 2,
            right: piece.x + (400 / GRID_COLS) / 2,
            top: piece.y - (400 / GRID_ROWS) / 2,
            bottom: piece.y + (400 / GRID_ROWS) / 2
        };
        return touchX >= pieceRect.left && touchX <= pieceRect.right &&
               touchY >= pieceRect.top && touchY <= pieceRect.bottom;
    });
    
    if (!touchedPiece) return;
    
    // Tüm parçaların dokunma noktasına olan mesafesini hesapla
    paperPieces.forEach(piece => {
        const distance = Math.sqrt(
            Math.pow(piece.x - touchX, 2) + 
            Math.pow(piece.y - touchY, 2)
        );
        piece.distance = distance;
    });
    
    // Mesafeye göre sırala
    paperPieces.sort((a, b) => a.distance - b.distance);
    
    // Parçaları sırayla yak
    paperPieces.forEach((piece, index) => {
        const delay = (piece.distance / 300) * 2000; // Mesafeye göre gecikme
        setTimeout(() => {
            piece.element.classList.add('burning');
            piece.burned = true;
            
            // Yanma animasyonu bitince tamamen şeffaf yap (fotoğraf görünsün)
            setTimeout(() => {
                piece.element.classList.add('burned');
                // Parça şeffaf oldu, arkasındaki fotoğraf görünür
            }, 400);
            
            // Tüm parçalar yandıysa
            if (index === paperPieces.length - 1) {
                setTimeout(() => {
                    paper.classList.add('burned');
                }, 500);
            }
        }, delay);
    });
    
    burnEffect.classList.add('active');
    burnOrigin.classList.add('active');
}

// Fotoğrafı göster - artık kullanılmıyor, fotoğraf zaten yüklü
function showPhoto() {
    // Fotoğraf zaten preloadPhoto() ile yüklenmiş
    // Parçalar yandıkça otomatik görünüyor
}


// Not Kartları - Döndürme Animasyonu (6 kart)
let isFlipping = false;
let cardOrder = [0, 1, 2, 3, 4, 5]; // Kart sırası

function getCardTransform(position) {
    const positions = [
        'translateY(0) rotateY(0deg) scale(1)',
        'translateY(6px) rotateY(1.5deg) scale(0.99)',
        'translateY(12px) rotateY(3deg) scale(0.98)',
        'translateY(18px) rotateY(4.5deg) scale(0.97)',
        'translateY(24px) rotateY(6deg) scale(0.96)',
        'translateY(30px) rotateY(7.5deg) scale(0.95)'
    ];
    return positions[position] || positions[5];
}

function getTopCardIndex() {
    return cardOrder[0];
}

function flipCard(card) {
    if (isFlipping) return;
    
    const cardIndex = parseInt(card.dataset.index);
    const topCardIndex = getTopCardIndex();
    
    // Sadece en üstteki kart tıklanabilir
    if (cardIndex !== topCardIndex) return;
    
    isFlipping = true;
    
    // Kart sırasını güncelle (en üstteki arkaya gidiyor)
    cardOrder.push(cardOrder.shift());
    
    // Önce z-index'leri anında güncelle (transition olmadan)
    noteCards.forEach((c) => {
        const cIndex = parseInt(c.dataset.index);
        const position = cardOrder.indexOf(cIndex);
        const z = 6 - position;
        c.style.zIndex = String(z);
        c.style.pointerEvents = position === 0 ? 'auto' : 'none';
    });
    
    // Dönen kartı başlat
    card.classList.add('flipping');
    card.style.opacity = '0';
    
    // Diğer kartları animasyonun yarısında güncelle (daha akıcı)
    setTimeout(() => {
        noteCards.forEach((c) => {
            const cIndex = parseInt(c.dataset.index);
            const position = cardOrder.indexOf(cIndex);
            c.style.transform = getCardTransform(position);
            c.style.opacity = '1';
        });
    }, 300);
    
    // Animasyon bitince dönen kartı sıfırla (en arkaya)
    setTimeout(() => {
        card.classList.remove('flipping');
        card.style.transform = getCardTransform(5);
        card.style.opacity = '1';
        isFlipping = false;
    }, 600);
}

// Kartlara tıklama event'i ekle
noteCards.forEach(card => {
    card.addEventListener('click', () => {
        flipCard(card);
    });
});

// Sayfa yüklendiğinde
window.addEventListener('load', () => {
    // Kağıt parçalarını oluştur
    createPaperPieces();
    
    // Fotoğrafı önceden yükle (görünür ama kağıt altında)
    preloadPhoto();
    
    // Kartların başlangıç pozisyonlarını ayarla (6 kart)
    noteCards.forEach((card) => {
        const cardIndex = parseInt(card.dataset.index);
        const position = cardOrder.indexOf(cardIndex);
        const z = 6 - position;
        card.style.zIndex = String(z);
        card.style.transform = getCardTransform(position);
        card.style.opacity = '1';
        card.style.pointerEvents = position === 0 ? 'auto' : 'none';
    });
    
    // Fotoğraf yolunu kontrol et
    // Kullanıcı index.html'de veya burada değiştirebilir
    console.log('İnteraktif deneyim hazır!');
    console.log('Fotoğraf eklemek için: script.js dosyasındaki showPhoto() fonksiyonunda photoImage.src değerini değiştirin');
});

// Fotoğrafı önceden yükle
function preloadPhoto() {
    photoImage.src = 'https://i.ibb.co/YBWY8pGH/asr5.jpg';
    photoImage.alt = 'Fotoğraf';
    // Fotoğraf zaten arkada, parçalar yandıkça görünecek
    backgroundPhoto.style.opacity = '1';
    backgroundPhoto.style.zIndex = '1';
}

