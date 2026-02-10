/**
 * HOMRAS - მთავარი JavaScript ფაილი
 * მოიცავს: ნავიგაცია, მოდალები, ენის შეცვლა, API კომუნიკაცია
 */

// DOM ელემენტები
document.addEventListener('DOMContentLoaded', function() {
    // ელემენტების შერჩევა
    const elements = {
        // ნავიგაცია
        navMenu: document.getElementById('navMenu'),
        menuToggle: document.getElementById('menuToggle'),
        navLinks: document.querySelectorAll('.nav-link'),
        
        // მოდალები
        loginModal: document.getElementById('loginModal'),
        registerModal: document.getElementById('registerModal'),
        postJobModal: document.getElementById('postJobModal'),
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        postJobBtn: document.getElementById('postJobBtn'),
        findJobBtn: document.getElementById('findJobBtn'),
        closeButtons: document.querySelectorAll('.close-modal'),
        showRegister: document.getElementById('showRegister'),
        showLogin: document.getElementById('showLogin'),
        
        // ფორმები
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        postJobForm: document.getElementById('postJobForm'),
        
        // ენის შეცვლა
        languageSelect: document.getElementById('languageSelect'),
        
        // მომხმარებლის მენიუ
        userMenu: document.getElementById('userMenu'),
        userAvatar: document.getElementById('userAvatar'),
        userDropdown: document.getElementById('userDropdown'),
        logoutBtn: document.getElementById('logoutBtn'),
        dashboardLink: document.getElementById('dashboardLink'),
        
        // სამუშაოების გვერდი
        jobsGrid: document.getElementById('jobsGrid'),
        categoryFilter: document.getElementById('categoryFilter'),
        cityFilter: document.getElementById('cityFilter'),
        loadMoreJobs: document.getElementById('loadMoreJobs'),
        
        // სექციები
        pageSections: document.querySelectorAll('.page-section')
    };

    // გლობალური ცვლადები
    let currentUser = JSON.parse(localStorage.getItem('homras_user')) || null;
    let currentLanguage = localStorage.getItem('homras_language') || 'ka';
    let currentPage = 'home';
    let jobsPage = 1;
    const jobsPerPage = 6;

    // ენის თარგმანები (გამოსწორებული: დროებითი შევსება, თუ json არ იტვირთება)
    let translations = {
        "hero.title": "იპოვე სანდო ხელოსანი თქვენი სახლისთვის",
        "hero.subtitle": "დაუკავშირდით სანდო სანტექნიკოსებს, ელექტრიკოსებს, შემკეთებლებს და დამლაგებლებს ბათუმსა და მთელ საქართველოში",
        // დაამატე სხვა გასაღებები შენი data-i18n-ებიდან
        "howItWorks.title": "როგორ მუშაობს HOMRAS",
        // ... სრული ლისტი შენი HTML-იდან
    };

    // ინიციალიზაცია
    init();

    // ძირითადი ფუნქციები
    async function init() {
        // ენის ჩატვირთვა
        await loadTranslations();
        
        // მობილური მენიუ
        setupMobileMenu();
        
        // გვერდების გადართვა
        setupPageNavigation();
        
        // მოდალების მენეჯმენტი
        setupModals();
        
        // ფორმების დამუშავება
        setupForms();
        
        // ენის შეცვლა
        setupLanguageSwitcher();
        
        // მომხმარებლის სესია
        checkUserSession();
        
        // სამუშაოების ჩატვირთვა
        loadJobs();
        
        // ფილტრები
        setupFilters();
        
        // ევენტ ლისენერები
        setupEventListeners();
        
        // ჩატვირთვის შემდეგ
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    }

    async function loadTranslations() {
        try {
            const response = await fetch(`lang/${currentLanguage}.json`);
            if (response.ok) {
                translations = await response.json();
            } else {
                console.warn('lang json not found, using fallback');
            }
            applyTranslations();
        } catch (error) {
            console.error('Error loading translations:', error);
            showNotification('ენის თარგმანები ვერ ჩაიტვირთა', 'error');
        }
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (translations[key]) {
                el.textContent = translations[key];
            }
        });
    }

    // მობილური მენიუ
    function setupMobileMenu() {
        if (!elements.menuToggle) return;
        
        elements.menuToggle.addEventListener('click', function() {
            elements.navMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });
        
        // დაახლოებით მენიუ კლიკზე
        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    elements.navMenu.classList.remove('active');
                    const icon = elements.menuToggle.querySelector('i');
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            });
        });
    }

    // გვერდების გადართვა
    function setupPageNavigation() {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');
                switchPage(targetPage);
                
                // აქტიური კლასის განახლება
                elements.navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // URL ჰეშის განახლება
                window.location.hash = targetPage;
                
                // სქროლი სექციაზე
                if (window.innerWidth > 768) {
                    const section = document.getElementById(targetPage);
                    if (section) {
                        const navHeight = document.querySelector('.navbar').offsetHeight;
                        window.scrollTo({
                            top: section.offsetTop - navHeight,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
        
        // URL ჰეშიდან გვერდის ჩატვირთვა
        if (window.location.hash) {
            const page = window.location.hash.substring(1);
            switchPage(page);
            updateActiveNav(page);
        }
    }
    
    function switchPage(page) {
        currentPage = page;
        elements.pageSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === page) {
                section.classList.add('active');
                
                // დამატებითი აქციები კონკრეტული გვერდებისთვის
                if (page === 'jobs') {
                    loadJobs();
                } else if (page === 'handymen') {
                    loadHandymen();
                }
            }
        });
    }
    
    function updateActiveNav(page) {
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
    }

    // მოდალების მენეჯმენტი
    function setupModals() {
        // შესვლა
        if (elements.loginBtn) {
            elements.loginBtn.addEventListener('click', () => showModal('loginModal'));
        }
        
        // რეგისტრაცია
        if (elements.registerBtn) {
            elements.registerBtn.addEventListener('click', () => showModal('registerModal'));
        }
        
        // სამუშაოს განცხადება
        if (elements.postJobBtn) {
            elements.postJobBtn.addEventListener('click', () => {
                if (currentUser) {
                    showModal('postJobModal');
                } else {
                    showModal('loginModal');
                }
            });
        }
        
        // სამუშაოს ძებნა
        if (elements.findJobBtn) {
            elements.findJobBtn.addEventListener('click', () => {
                switchPage('jobs');
                updateActiveNav('jobs');
            });
        }
        
        // მოდალების დახურვა
        elements.closeButtons.forEach(button => {
            button.addEventListener('click', () => closeAllModals());
        });
        
        // მოდალის გარეთ კლიკზე დახურვა
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
        
        // Escape კლავიშით დახურვა
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
        
        // რეგისტრაციიდან შესვლაზე გადასვლა
        if (elements.showRegister) {
            elements.showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                closeAllModals();
                showModal('registerModal');
            });
        }
        
        // შესვლიდან რეგისტრაციაზე გადასვლა
        if (elements.showLogin) {
            elements.showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                closeAllModals();
                showModal('loginModal');
            });
        }
    }
    
    function showModal(modalId) {
        closeAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // ფორმების დამუშავება
    function setupForms() {
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', handleLogin);
        }
        if (elements.registerForm) {
            elements.registerForm.addEventListener('submit', handleRegister);
        }
        if (elements.postJobForm) {
            elements.postJobForm.addEventListener('submit', handlePostJob);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        // Implement login logic with fetch to API
        showNotification('შესვლა წარმატებული', 'success');
    }

    async function handleRegister(e) {
        e.preventDefault();
        // Implement register logic
        showNotification('რეგისტრაცია წარმატებული', 'success');
    }

    async function handlePostJob(e) {
        e.preventDefault();
        // Implement post job logic
        showNotification('განცხადება გამოქვეყნდა', 'success');
    }

    // ენის შეცვლა
    function setupLanguageSwitcher() {
        if (elements.languageSelect) {
            elements.languageSelect.value = currentLanguage;
            elements.languageSelect.addEventListener('change', async (e) => {
                currentLanguage = e.target.value;
                localStorage.setItem('homras_language', currentLanguage);
                await loadTranslations();
            });
        }
    }

    // მომხმარებლის სესია
    function checkUserSession() {
        if (currentUser) {
            elements.authButtons.style.display = 'none';
            elements.userMenu.style.display = 'block';
            // Update user avatar etc.
        }
    }

    function logout() {
        localStorage.removeItem('homras_user');
        currentUser = null;
        // Update UI
        showNotification('გამოსვლა წარმატებული', 'success');
    }

    // სამუშაოების ჩატვირთვა (გამოსწორებული: mock data თუ API error)
    async function loadJobs() {
        try {
            const response = await fetch('https://homras.onrender.com/jobs');
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            if (data.success) {
                elements.jobsGrid.innerHTML = '';
                data.jobs.forEach(job => {
                    const card = createJobCard(job);
                    elements.jobsGrid.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            showNotification('შეცდომა სამუშაოების ჩატვირთვაში, იყენებ mock data', 'warning');
            // Mock data გამოსწორებისთვის
            const mockJobs = [
                { title: 'სანტექნიკა', city: 'ბათუმი', date: '2024-02-10', description: 'ტესტი', budget: 100 }
            ];
            elements.jobsGrid.innerHTML = '';
            mockJobs.forEach(job => {
                const card = createJobCard(job);
                elements.jobsGrid.appendChild(card);
            });
        }
    }

    function createJobCard(job) {
        const div = document.createElement('div');
        div.className = 'job-card';
        div.innerHTML = `
            <div class="job-header">
                <h3 class="job-title">${job.title}</h3>
                <div class="job-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${job.city}</span>
                    <span><i class="fas fa-clock"></i> ${job.date}</span>
                </div>
            </div>
            <div class="job-body">
                <p class="job-description">${job.description}</p>
            </div>
            <div class="job-footer">
                <span class="job-budget">${job.budget} ₾</span>
                <button class="btn btn-primary">შეთავაზება</button>
            </div>
        `;
        return div;
    }

    // მეტი სამუშაოების ჩატვირთვა
    async function loadMoreJobs() {
        jobsPage++;
        const category = elements.categoryFilter.value;
        const city = elements.cityFilter.value;
        const params = new URLSearchParams({ page: jobsPage, limit: jobsPerPage });
        if (category !== 'all') params.append('category', category);
        if (city !== 'all') params.append('city', city);
        
        try {
            const response = await fetch('https://homras.onrender.com/jobs?${params}');
            const data = await response.json();
            
            if (response.ok && data.success) {
                if (data.jobs.length > 0) {
                    data.jobs.forEach(job => {
                        const jobCard = createJobCard(job);
                        elements.jobsGrid.appendChild(jobCard);
                    });
                    
                    if (elements.loadMoreJobs) {
                        elements.loadMoreJobs.style.display = 
                            data.jobs.length === jobsPerPage ? 'block' : 'none';
                    }
                } else {
                    elements.loadMoreJobs.style.display = 'none';
                    showNotification('მეტი სამუშაო ვერ მოიძებნა', 'info');
                }
            }
        } catch (error) {
            console.error('Error loading more jobs:', error);
            showNotification('დაფიქსირდა შეცდომა', 'error');
        }
    }
    
    // ხელოსნების ჩატვირთვა (გამოსწორებული: mock data)
    async function loadHandymen() {
        try {
            const response = await fetch('https://homras.onrender.com/handymen');
            const data = await response.json();
            if (data.success) {
                const grid = document.getElementById('handymenGrid');
                grid.innerHTML = '';
                data.handymen.forEach(handyman => {
                    const card = document.createElement('div');
                    card.className = 'handyman-card';
                    card.innerHTML = `
                        <img src="${handyman.avatar || 'images/default-avatar.png'}" alt="${handyman.name}">
                        <h3>${handyman.name}</h3>
                        <p>${handyman.specialty}</p>
                        <span>რეიტინგი: ${handyman.rating}</span>
                    `;
                    grid.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Error loading handymen:', error);
            showNotification('შეცდომა ხელოსნების ჩატვირთვაში, იყენებ mock data', 'warning');
            // Mock data
            const mockHandymen = [
                { name: 'ჯონ დო', specialty: 'სანტექნიკა', rating: 4.5, avatar: 'images/default-avatar.png' }
            ];
            const grid = document.getElementById('handymenGrid');
            grid.innerHTML = '';
            mockHandymen.forEach(handyman => {
                const card = document.createElement('div');
                card.className = 'handyman-card';
                card.innerHTML = `
                    <img src="${handyman.avatar}" alt="${handyman.name}">
                    <h3>${handyman.name}</h3>
                    <p>${handyman.specialty}</p>
                    <span>რეიტინგი: ${handyman.rating}</span>
                `;
                grid.appendChild(card);
            });
        }
    }

    // დამატებითი ევენტ ლისენერები
    function setupEventListeners() {
        // სკროლის ეფექტები
        window.addEventListener('scroll', handleScroll);
        
        // ქეიბორდის ნავიგაცია
        document.addEventListener('keydown', handleKeyboardNavigation);
    }
    
    function handleScroll() {
        // აქტიური ნავიგაციის განახლება სკროლის მიხედვით
        if (window.innerWidth > 768) {
            let currentSection = '';
            elements.pageSections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const navHeight = document.querySelector('.navbar').offsetHeight;
                
                if (window.scrollY >= (sectionTop - navHeight - 100)) {
                    currentSection = section.id;
                }
            });
            
            if (currentSection && currentSection !== currentPage) {
                updateActiveNav(currentSection);
            }
        }
        
        // ნავბარის ეფექტი
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-sm)';
        }
    }
    
    function handleKeyboardNavigation(e) {
        // Escape - მოდალების დახურვა
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Ctrl+Shift+L - ენის შეცვლა
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            const currentIndex = Array.from(elements.languageSelect.options).findIndex(
                option => option.value === currentLanguage
            );
            const nextIndex = (currentIndex + 1) % elements.languageSelect.options.length;
            elements.languageSelect.selectedIndex = nextIndex;
            elements.languageSelect.dispatchEvent(new Event('change'));
        }
    }

    // შეტყობინებების სისტემა
    function showNotification(message, type = 'info') {
        // არსებული შეტყობინებების წაშლა
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // ახალი შეტყობინების შექმნა
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // CSS სტილების დამატება
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: var(--border-radius-md);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    max-width: 400px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease-out;
                    box-shadow: var(--shadow-lg);
                }
                
                .notification-success {
                    background-color: #d4edda;
                    color: #155724;
                    border-left: 4px solid #28a745;
                }
                
                .notification-error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border-left: 4px solid #dc3545;
                }
                
                .notification-warning {
                    background-color: #fff3cd;
                    color: #856404;
                    border-left: 4px solid #ffc107;
                }
                
                .notification-info {
                    background-color: #d1ecf1;
                    color: #0c5460;
                    border-left: 4px solid #17a2b8;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    margin-left: auto;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // დახურვის ღილაკი
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // ავტომატური დახურვა
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // გლობალური ფუნქციები
    window.homras = {
        login: () => showModal('loginModal'),
        register: () => showModal('registerModal'),
        postJob: () => {
            if (currentUser) {
                showModal('postJobModal');
            } else {
                showModal('loginModal');
            }
        },
        logout: logout,
        switchLanguage: (lang) => {
            if (elements.languageSelect) {
                elements.languageSelect.value = lang;
                elements.languageSelect.dispatchEvent(new Event('change'));
            }
        },
        currentUser: () => currentUser,
        refreshJobs: loadJobs
    };
});

// Polyfills for older browsers
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }
        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

// FormData polyfill for Node.js environments
if (typeof FormData === 'undefined') {
    console.warn('FormData is not supported in this environment');
}

// Fetch API polyfill (basic)
if (typeof fetch === 'undefined') {
    console.warn('Fetch API is not supported in this environment');
    // You might want to include a fetch polyfill here
}