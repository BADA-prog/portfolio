window.currentSection = 0;
window.isScrolling = false;

window.toggleTheme = function() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('theme-icon').innerText = isDark ? '☀️' : '🌙';
    document.getElementById('theme-text').innerText = isDark ? 'Light Mode' : 'Dark Mode';

    if (window.particleMaterial) {
        if (isDark) { 
            window.particleMaterial.color.setHex(0x0284c7); 
            window.particleMaterial.blending = 1; 
        } else { 
            window.particleMaterial.color.setHex(0x00f2fe); 
            window.particleMaterial.blending = 2; 
        }
    }
};

window.goToSection = (idx) => {
    if (window.isScrolling) return;

    const homeEl = document.getElementById('home-content');
    document.querySelectorAll('.section-container').forEach(sec => {
        sec.classList.remove('active');
    });

    const targetEl = document.getElementById(`section-${idx}`);
    if (idx === 0) {
        if (homeEl) homeEl.classList.add('active');
    } else {
        if (homeEl) homeEl.classList.remove('active');
        if (targetEl) targetEl.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        const sectionNum = parseInt(link.getAttribute('data-section'));
        link.classList.toggle('active', sectionNum === idx);
    });

    if (window.morphToShape) window.morphToShape(idx);
    
    if (idx === 2) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            filterBtns[0].classList.add('active'); 
        }
        document.querySelectorAll('.exp-item').forEach(item => {
            item.style.display = 'flex';
            item.style.opacity = '';
            item.style.transform = '';
        });
        handleExperienceAnimation();
    }

    if (idx === 4) {
        const folders = document.querySelectorAll('.folder-card');
        folders.forEach((folder, i) => {
            if (i === 0) folder.classList.add('active');
            else folder.classList.remove('active');
        });
        const wrapper = document.querySelector('.project-folder-wrapper');
        if (wrapper) wrapper.scrollTop = 0;
    }

    window.currentSection = idx;
    window.isScrolling = true;
    setTimeout(() => { window.isScrolling = false; }, 1000);
};

window.handleExperienceAnimation = function() {
    const expLine = document.querySelector('.exp-line');
    const glowDot = document.querySelector('.exp-dot-glow');
    const expItems = document.querySelectorAll('.exp-item');
    const scrollArea = document.querySelector('.exp-scroll-area');
    const trigger = document.querySelector('.next-section-trigger');
    const lineDuration = 3000;

    const activeBtn = document.querySelector('.filter-btn.active');
    const currentCategory = activeBtn ? activeBtn.getAttribute('data-filter') : 'ALL';
    if (window.updateYearVisibility) window.updateYearVisibility(currentCategory);

    if (scrollArea) scrollArea.scrollTop = 0;
    if (expLine) expLine.classList.remove('show', 'finished');
    if (glowDot) { 
        glowDot.classList.remove('show', 'finished'); 
        glowDot.style.top = '20px'; 
        glowDot.style.transition = 'none'; 
    }
    
    expItems.forEach(item => item.classList.remove('show'));
    if (trigger) trigger.classList.remove('show'); 

    setTimeout(() => {
        if (expLine) expLine.classList.add('show');
        if (glowDot) {
            glowDot.classList.add('show');
            const lineHeight = expLine.offsetHeight;
            glowDot.style.transition = `top ${lineDuration}ms linear, opacity 0.3s`; 
            glowDot.style.top = (20 + lineHeight) + 'px';
        }
        
        let visibleItems = Array.from(expItems).filter(item => item.style.display !== 'none');
        if (visibleItems.length === 0) visibleItems = Array.from(expItems);

        visibleItems.forEach((item, i) => {
            setTimeout(() => item.classList.add('show'), (i / visibleItems.length) * lineDuration); 
        });
    }, 1500);
};

window.addEventListener('wheel', (e) => {
    if (window.isScrolling) return;

    if (window.currentSection === 0) {
        if (e.deltaY > 0) window.goToSection(1);
        return;
    }
    if (window.currentSection === 1) {
        if (e.deltaY > 0) window.goToSection(2);
        else if (e.deltaY < 0) window.goToSection(0);
        return;
    }
    if (window.currentSection === 2) {
        const scrollArea = document.querySelector('.exp-scroll-area');
        if (scrollArea) {
            const isAtBottom = Math.ceil(scrollArea.scrollTop + scrollArea.clientHeight) >= scrollArea.scrollHeight - 10;
            const isAtTop = scrollArea.scrollTop <= 5;
            if (!isAtBottom && e.deltaY > 0) { scrollArea.scrollTop += e.deltaY; e.preventDefault(); return; }
            else if (!isAtTop && e.deltaY < 0) { scrollArea.scrollTop += e.deltaY; e.preventDefault(); return; }
            if (e.deltaY > 0 && isAtBottom) window.goToSection(3);
            else if (e.deltaY < 0 && isAtTop) window.goToSection(1);
        }
        return;
    }

    const activeSec = document.getElementById(`section-${window.currentSection}`);
    if (activeSec) {
        const isAtBottom = Math.ceil(activeSec.scrollTop + activeSec.clientHeight) >= activeSec.scrollHeight - 10;
        const isAtTop = activeSec.scrollTop <= 5;
        if (e.deltaY > 0 && isAtBottom && window.currentSection < 4) window.goToSection(window.currentSection + 1);
        else if (e.deltaY < 0 && isAtTop) window.goToSection(window.currentSection - 1);
    }
}, { passive: false });

window.toggleEducationView = function() {
    const subjects = document.getElementById('subjects-list');
    const gpa = document.getElementById('gpa-container');
    subjects.style.display = subjects.style.display === 'none' ? 'block' : 'none';
    gpa.style.display = gpa.style.display === 'none' ? 'block' : 'none';
};

window.updateYearVisibility = function(category) {
    const items = document.querySelectorAll('.exp-item');
    let lastVisibleYear = null;

    items.forEach(item => {
        const rawCat = item.getAttribute('data-category');
        const itemCat = rawCat ? rawCat.trim().toUpperCase() : '';
        const currentYear = item.getAttribute('data-year');
        const yearEl = item.querySelector('.exp-year');
        if (!yearEl) return;

        if (category === 'ALL' || itemCat === category) {
            if (currentYear === lastVisibleYear) {
                yearEl.style.opacity = '0';
            } else {
                yearEl.style.opacity = '1';
                lastVisibleYear = currentYear;
            }
        }
    });
};

window.filterExperience = function(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    if (window.updateYearVisibility) window.updateYearVisibility(category);

    const items = document.querySelectorAll('.exp-item');
    const trigger = document.querySelector('.next-section-trigger');
    
    if (trigger) trigger.classList.remove('show');

    items.forEach(item => {
        const rawCat = item.getAttribute('data-category');
        const itemCat = rawCat ? rawCat.trim().toUpperCase() : '';
        item.style.opacity = '';
        item.style.transform = '';

        if (category === 'ALL' || itemCat === category) {
            item.style.display = 'flex'; 
            setTimeout(() => item.classList.add('show'), 50);
        } else {
            item.classList.remove('show');
            setTimeout(() => {
                if (!item.classList.contains('show')) item.style.display = 'none';
            }, 400); 
        }
    });

    const scrollArea = document.querySelector('.exp-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
    setTimeout(() => { if (trigger) trigger.classList.add('show'); }, 800);
};

window.showReference = function(expId) {
    const allRefs = document.querySelectorAll('.ref-card');
    const targetRef = document.getElementById(`ref-${expId}`);
    const defaultMsg = document.getElementById('ref-default-msg');

    allRefs.forEach(ref => {
        ref.style.opacity = '0';
        ref.style.transform = 'translateY(15px)';
        ref.style.pointerEvents = 'none';
    });

    if (targetRef) {
        if (defaultMsg) defaultMsg.style.opacity = '0';
        targetRef.style.opacity = '1';
        targetRef.style.transform = 'translateY(0)';
        targetRef.style.pointerEvents = 'auto';
        targetRef.classList.add('highlight'); 
    } else {
        if (defaultMsg) defaultMsg.style.opacity = '0.4';
    }
};

window.activateFolder = function(element) {
    if (element.classList.contains('active')) {
        element.classList.remove('active');
        return;
    }
    const allFolders = document.querySelectorAll('.folder-card');
    allFolders.forEach(folder => folder.classList.remove('active'));
    element.classList.add('active');
};

const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    dot.style.transform = `translate(${posX}px, ${posY}px)`;
    outline.animate({
        left: `${posX - 20}px`,
        top: `${posY - 20}px`
    }, { duration: 500, fill: "forwards" });
});

const interactiveElements = document.querySelectorAll('a, button, .exp-content, .about-feature-card');
interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => outline.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => outline.classList.remove('cursor-hover'));
});

document.addEventListener('DOMContentLoaded', () => {
    const scrollArea = document.querySelector('.exp-scroll-area');
    const trigger = document.querySelector('.next-section-trigger');
    if (scrollArea && trigger) {
        scrollArea.addEventListener('scroll', () => {
            const currentPos = scrollArea.scrollTop + scrollArea.clientHeight;
            const totalHeight = scrollArea.scrollHeight;
            if (currentPos >= totalHeight - 150) {
                if (!trigger.classList.contains('show')) trigger.classList.add('show');
            } else {
                if (trigger.classList.contains('show')) trigger.classList.remove('show');
            }
        });
    }
    window.goToSection(0); 
});