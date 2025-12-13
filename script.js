/* =========================================
   1. CORE VISIBILITY & PRELOADER
   ========================================= */
window.addEventListener('load', () => {
    // 1.5s delay to show off preloader
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 1500); 
});

// Dynamic Tab Title
let docTitle = document.title;
window.addEventListener("blur", () => { document.title = "Come back! 🚀"; });
window.addEventListener("focus", () => { document.title = docTitle; });

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Scroll Pop-in
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
}, { threshold: 0.1 });
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pop-in').forEach(el => observer.observe(el));
});

// Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
if (cursorDot && cursorOutline) {
    let cursorX = 0, cursorY = 0, pageX = 0, pageY = 0;
    document.addEventListener('mousemove', (e) => {
        pageX = e.clientX; pageY = e.clientY;
        cursorDot.style.transform = `translate3d(${pageX}px, ${pageY}px, 0) translate(-50%, -50%)`;
    });
    function animateCursor() {
        cursorX += (pageX - cursorX) * 0.5;
        cursorY += (pageY - cursorY) * 0.5;
        cursorOutline.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// Hover States
document.querySelectorAll('a, button, .clean-card, .slider-btn, .project-split-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

/* =========================================
   2. SLIDER LOGIC
   ========================================= */
const track = document.querySelector('.slider-track');
if (track) {
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const counter = document.querySelector('.slide-counter');
    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateSlide() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }

    if(nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlide();
        });
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlide();
        });
    }
}

/* =========================================
   3. THREE.JS BACKGROUND
   ========================================= */
const container = document.getElementById('canvas-container');
if (container && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25; 
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    const group = new THREE.Group();
    scene.add(group);

    // Core & Wireframe
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(9, 2), new THREE.MeshBasicMaterial({ color: 0x1e293b }));
    group.add(core);
    const wireSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(9, 2), new THREE.MeshBasicMaterial({ color: 0x64748b, wireframe: true, transparent: true, opacity: 0.2 }));
    group.add(wireSphere);

    // Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 300;
    const posArray = new Float32Array(particleCount * 3);
    const colorsArray = new Float32Array(particleCount * 3);
    const palette = [new THREE.Color('#d97706'), new THREE.Color('#059669'), new THREE.Color('#7c3aed'), new THREE.Color('#dc2626'), new THREE.Color('#0284c7')];

    for(let i = 0; i < particleCount; i++) {
        const r = 12 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        posArray[i*3] = r * Math.sin(phi) * Math.cos(theta);      
        posArray[i*3+1] = r * Math.sin(phi) * Math.sin(theta);    
        posArray[i*3+2] = r * Math.cos(phi);
        const color = palette[Math.floor(Math.random() * palette.length)];
        colorsArray[i*3] = color.r; colorsArray[i*3+1] = color.g; colorsArray[i*3+2] = color.b;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    const particlesMesh = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ size: 0.15, vertexColors: true }));
    group.add(particlesMesh);

    // Animation
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        wireSphere.rotation.y = time * 0.1;
        particlesMesh.rotation.y = -time * 0.05;
        group.rotation.x += (mouseY * 0.2 - group.rotation.x) * 0.05;
        group.rotation.y += (mouseX * 0.2 - group.rotation.y) * 0.05;
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* =========================================
   4. SPOTLIGHT HOVER EFFECT
   ========================================= */
const cards = document.querySelectorAll('.clean-card, .metrics-card, .project-split-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

/* =========================================
   5. NAVIGATION SCROLL SPY & BACK TO TOP
   ========================================= */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.links a');
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    let current = '';
    
    // 1. Highlight Nav Links
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // -150 offset to trigger highlight slightly before reaching the exact top
        if (scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        // Only if link has an href (ignore theme toggle btn)
        if (link.getAttribute('href') && link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });

    // 2. Show/Hide Back to Top Button
    if (scrollY > 500) {
        backToTopBtn?.classList.add('visible');
    } else {
        backToTopBtn?.classList.remove('visible');
    }
});

// Scroll to Top Functionality
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Add hover effect for cursor
    backToTopBtn.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    backToTopBtn.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
}
