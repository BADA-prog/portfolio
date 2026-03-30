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

    // 1. 모든 섹션의 스크롤과 위치 강제 리셋
    window.scrollTo({ top: 0, behavior: 'instant' }); 
    
    // 2. 섹션별 브라우저 스크롤 정책 설정
    if (idx === 0) {
        document.documentElement.style.overflow = 'hidden'; 
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    } else {
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
    }

    const homeEl = document.getElementById('home-content');
    const sections = document.querySelectorAll('.section-container');
    
    // 3. 모든 섹션 클래스 및 트랜스폼 초기화
    sections.forEach(sec => {
        sec.classList.remove('active');
        sec.style.transform = 'none';
        sec.style.top = '0';
    });

    // 4. 타겟 섹션 활성화
    const targetEl = document.getElementById(`section-${idx}`);
    if (idx === 0) {
        if (homeEl) homeEl.classList.add('active');
    } else {
        if (homeEl) homeEl.classList.remove('active');
        if (targetEl) targetEl.classList.add('active');
    }

    // 5. [중요!] 섹션 4 (PROJECTS) 진입 시 무조건 Folder 01 활성화
    if (idx === 4) {
        const folders = document.querySelectorAll('.folder-card');
        folders.forEach((folder, i) => {
            if (i === 0) folder.classList.add('active');
            else folder.classList.remove('active');
        });
        const wrapper = document.querySelector('.project-folder-wrapper');
        if (wrapper) wrapper.scrollTop = 0;
    }

    // 6. 네비게이션 메뉴 활성화 상태 동기화
    document.querySelectorAll('.nav-link').forEach(link => {
        const sectionNum = parseInt(link.getAttribute('data-section'));
        link.classList.toggle('active', sectionNum === idx);
    });

    // 7. 시각 효과 및 애니메이션 실행
    if (window.morphToShape) window.morphToShape(idx);
    if (idx === 2) handleExperienceAnimation();

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

// 휠 이벤트: 섹션 1, 4에서 브라우저 권한을 완전히 풀어줌
window.addEventListener('wheel', (e) => {
    if (window.isScrolling) return;


    if (window.currentSection === 2) {
        const scrollArea = document.querySelector('.exp-scroll-area');
        if (scrollArea) {
            const isAtBottom = Math.ceil(scrollArea.scrollTop + scrollArea.clientHeight) >= scrollArea.scrollHeight - 10;
            const isAtTop = scrollArea.scrollTop <= 5;
            if (e.deltaY > 0 && !isAtBottom) { scrollArea.scrollTop += e.deltaY; e.preventDefault(); }
            else if (e.deltaY < 0 && !isAtTop) { scrollArea.scrollTop += e.deltaY; e.preventDefault(); }
        }
        return;
    }

    // 섹션 1, 4는 브라우저 기본 스크롤에 맡김 (e.preventDefault() 안 함)
    if (window.currentSection === 1 || window.currentSection === 4) {
        return; 
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