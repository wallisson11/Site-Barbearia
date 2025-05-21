// Configuração da API
const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let currentUser = null;

// Elementos DOM
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const alertModal = document.getElementById('alert-modal');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const perfilLink = document.getElementById('perfil-link');
const agendarBtn = document.getElementById('agendar-btn');
const navLinks = document.querySelectorAll('.nav-link');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    checkAuth();
    
    // Carregar página inicial
    loadHomePage();
    
    // Configurar eventos de navegação
    setupNavigation();
    
    // Configurar modais
    setupModals();
    
    // Configurar formulários
    setupForms();
    
    // Configurar menu responsivo
    setupResponsiveMenu();
});

// Verificar autenticação
function checkAuth() {
    if (token) {
        fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Token inválido');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                currentUser = data.data;
                updateAuthUI(true);
            } else {
                logout();
            }
        })
        .catch(error => {
            console.error('Erro ao verificar autenticação:', error);
            logout();
        });
    } else {
        updateAuthUI(false);
    }
}

// Atualizar UI baseado no estado de autenticação
function updateAuthUI(isAuthenticated) {
    if (isAuthenticated) {
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        perfilLink.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        perfilLink.classList.add('hidden');
    }
}

// Configurar navegação
function setupNavigation() {
    // Navegação entre páginas
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // Botão de agendar na página inicial
    agendarBtn.addEventListener('click', () => {
        if (token) {
            navigateTo('agendamento');
        } else {
            showLoginModal();
        }
    });
    
    // Botão de logout
    logoutBtn.addEventListener('click', logout);
}

// Navegar para uma página
function navigateTo(page) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Mostrar a página selecionada
    document.getElementById(`${page}-page`).classList.add('active');
    
    // Fechar menu móvel se estiver aberto
    nav.classList.remove('active');
    
    // Carregar conteúdo da página
    switch (page) {
        case 'servicos':
            loadServicos();
            break;
        case 'agendamento':
            if (!token) {
                showLoginModal();
                navigateTo('home');
                return;
            }
            loadAgendamentoForm();
            break;
        case 'avaliacoes':
            loadAvaliacoes();
            break;
        case 'perfil':
            if (!token) {
                showLoginModal();
                navigateTo('home');
                return;
            }
            loadPerfil();
            break;
    }
}

// Configurar modais
function setupModals() {
    // Fechar modais ao clicar no X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Fechar modais ao clicar fora deles
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Abrir modal de login
    loginBtn.addEventListener('click', showLoginModal);
    
    // Abrir modal de cadastro
    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
    });
    
    // Alternar entre modais
    document.getElementById('switch-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });
    
    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });
    
    // Botão OK do modal de alerta
    document.getElementById('alert-ok').addEventListener('click', () => {
        alertModal.style.display = 'none';
    });
}

// Mostrar modal de login
function showLoginModal() {
    loginModal.style.display = 'block';
}

// Mostrar alerta
function showAlert(title, message) {
    document.getElementById('alert-title').textContent = title;
    document.getElementById('alert-message').textContent = message;
    alertModal.style.display = 'block';
}

// Configurar formulários
function setupForms() {
    // Formulário de login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        
        fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                token = data.token;
                localStorage.setItem('token', token);
                loginModal.style.display = 'none';
                checkAuth();
                showAlert('Sucesso', 'Login realizado com sucesso!');
            } else {
                showAlert('Erro', data.error || 'Credenciais inválidas');
            }
        })
        .catch(error => {
            console.error('Erro ao fazer login:', error);
            showAlert('Erro', 'Ocorreu um erro ao fazer login. Tente novamente.');
        });
    });
    
    // Formulário de cadastro
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('register-nome').value;
        const email = document.getElementById('register-email').value;
        const telefone = document.getElementById('register-telefone').value;
        const senha = document.getElementById('register-senha').value;
        const confirmarSenha = document.getElementById('register-confirmar-senha').value;
        
        if (senha !== confirmarSenha) {
            showAlert('Erro', 'As senhas não coincidem');
            return;
        }
        
        fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, telefone, senha })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                token = data.token;
                localStorage.setItem('token', token);
                registerModal.style.display = 'none';
                checkAuth();
                showAlert('Sucesso', 'Cadastro realizado com sucesso! Um e-mail de confirmação foi enviado.');
            } else {
                showAlert('Erro', data.error || 'Erro ao cadastrar');
            }
        })
        .catch(error => {
            console.error('Erro ao cadastrar:', error);
            showAlert('Erro', 'Ocorreu um erro ao cadastrar. Tente novamente.');
        });
    });
}

// Configurar menu responsivo
function setupResponsiveMenu() {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

// Logout
function logout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    updateAuthUI(false);
    navigateTo('home');
    showAlert('Logout', 'Você saiu da sua conta');
}

// Carregar página inicial
function loadHomePage() {
    // Nada a fazer aqui, conteúdo é estático
}

// Carregar serviços
function loadServicos() {
    const servicosLista = document.getElementById('servicos-lista');
    
    // Mostrar skeletons enquanto carrega
    servicosLista.innerHTML = `
        <div class="servico-card skeleton"></div>
        <div class="servico-card skeleton"></div>
        <div class="servico-card skeleton"></div>
    `;
    
    fetch(`${API_URL}/servicos`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            servicosLista.innerHTML = '';
            
            data.data.forEach(servico => {
                const servicoCard = document.createElement('div');
                servicoCard.className = 'servico-card';
                
                let imagemUrl;
                switch (servico.tipo) {
                    case 'corte':
                        imagemUrl = '../assets/corte.jpg';
                        break;
                    case 'barba':
                        imagemUrl = '../assets/barba.jpg';
                        break;
                    case 'combo':
                        imagemUrl = '../assets/combo.jpg';
                        break;
                    default:
                        imagemUrl = '../assets/default.jpg';
                }
                
                servicoCard.innerHTML = `
                    <div class="servico-img" style="background-image: url('${imagemUrl}')"></div>
                    <div class="servico-info">
                        <h3>${servico.nome}</h3>
                        <p>${servico.descricao}</p>
                        <div class="servico-footer">
                            <span class="servico-preco">R$ ${servico.preco.toFixed(2)}</span>
                            <button class="btn btn-primary agendar-servico" data-id="${servico._id}">Agendar</button>
                        </div>
                    </div>
                `;
                
                servicosLista.appendChild(servicoCard);
            });
            
            // Adicionar evento aos botões de agendar
            document.querySelectorAll('.agendar-servico').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (token) {
                        const servicoId = btn.getAttribute('data-id');
                        navigateTo('agendamento');
                        document.getElementById('servico-select').value = servicoId;
                    } else {
                        showLoginModal();
                    }
                });
            });
        } else {
            servicosLista.innerHTML = '<p>Erro ao carregar serviços</p>';
        }
    })
    .catch(error => {
        console.error('Erro ao carregar serviços:', error);
        servicosLista.innerHTML = '<p>Erro ao carregar serviços</p>';
    });
}

// Carregar formulário de agendamento
function loadAgendamentoForm() {
    const servicoSelect = document.getElementById('servico-select');
    const horarioSelect = document.getElementById('horario-select');
    const dataAgendamento = document.getElementById('data-agendamento');
    const imagemReferencia = document.getElementById('imagem-referencia');
    const previewContainer = document.getElementById('preview-container');
    const imagemPreview = document.getElementById('imagem-preview');
    const removerImagem = document.getElementById('remover-imagem');
    const confirmarAgendamento = document.getElementById('confirmar-agendamento');
    
    // Limpar formulário
    servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';
    horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
    dataAgendamento.value = '';
    imagemReferencia.value = '';
    previewContainer.classList.add('hidden');
    document.getElementById('observacoes').value = '';
    
    // Definir data mínima (hoje)
    const hoje = new Date();
    const dataMinima = hoje.toISOString().split('T')[0];
    dataAgendamento.setAttribute('min', dataMinima);
    
    // Carregar serviços
    fetch(`${API_URL}/servicos`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            data.data.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico._id;
                option.textContent = `${servico.nome} - R$ ${servico.preco.toFixed(2)}`;
                servicoSelect.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar serviços:', error);
    });
    
    // Carregar horários
    fetch(`${API_URL}/horarios`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            data.data.forEach(horario => {
                const option = document.createElement('option');
                option.value = horario;
                option.textContent = horario;
                horarioSelect.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar horários:', error);
    });
    
    // Preview de imagem
    imagemReferencia.addEventListener('change', () => {
        const file = imagemReferencia.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagemPreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Remover imagem
    removerImagem.addEventListener('click', () => {
        imagemReferencia.value = '';
        previewContainer.classList.add('hidden');
    });
    
    // Confirmar agendamento
    confirmarAgendamento.addEventListener('click', () => {
        const servico = servicoSelect.value;
        const data = dataAgendamento.value;
        const horario = horarioSelect.value;
        const observacoes = document.getElementById('observacoes').value;
        
        if (!servico || !data || !horario) {
            showAlert('Erro', 'Por favor, preencha todos os campos obrigatórios');
            return;
        }
        
        // Mostrar modal de confirmação
        const servicoText = servicoSelect.options[servicoSelect.selectedIndex].text;
        const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
        
        document.getElementById('confirmation-details').innerHTML = `
            <p><strong>Serviço:</strong> ${servicoText}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Horário:</strong> ${horario}</p>
            <p><strong>Observações:</strong> ${observacoes || 'Nenhuma'}</p>
        `;
        
        confirmationModal.style.display = 'block';
        
        // Confirmar agendamento final
        document.getElementById('confirmar-final').onclick = () => {
            // Criar agendamento
            fetch(`${API_URL}/agendamentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    servico,
                    data,
                    horario,
                    observacoes
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    confirmationModal.style.display = 'none';
                    
                    // Se tiver imagem, fazer upload
                    if (imagemReferencia.files.length > 0) {
                        const formData = new FormData();
                        formData.append('imagem', imagemReferencia.files[0]);
                        
                        fetch(`${API_URL}/agendamentos/${data.data._id}/imagem`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: formData
                        })
                        .then(response => response.json())
                        .then(uploadData => {
                            if (uploadData.success) {
                                showAlert('Sucesso', 'Agendamento realizado com sucesso! Um e-mail de confirmação foi enviado.');
                                navigateTo('perfil');
                            } else {
                                showAlert('Aviso', 'Agendamento realizado, mas houve um erro ao enviar a imagem.');
                                navigateTo('perfil');
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao enviar imagem:', error);
                            showAlert('Aviso', 'Agendamento realizado, mas houve um erro ao enviar a imagem.');
                            navigateTo('perfil');
                        });
                    } else {
                        showAlert('Sucesso', 'Agendamento realizado com sucesso! Um e-mail de confirmação foi enviado.');
                        navigateTo('perfil');
                    }
                } else {
                    confirmationModal.style.display = 'none';
                    showAlert('Erro', data.error || 'Erro ao realizar agendamento');
                }
            })
            .catch(error => {
                console.error('Erro ao realizar agendamento:', error);
                confirmationModal.style.display = 'none';
                showAlert('Erro', 'Ocorreu um erro ao realizar o agendamento. Tente novamente.');
            });
        };
        
        // Cancelar agendamento
        document.getElementById('cancelar-agendamento').onclick = () => {
            confirmationModal.style.display = 'none';
        };
    });
}

// Carregar avaliações
function loadAvaliacoes() {
    const avaliacoesLista = document.getElementById('avaliacoes-lista');
    const avaliacaoFormContainer = document.getElementById('avaliacao-form-container');
    
    // Mostrar skeletons enquanto carrega
    avaliacoesLista.innerHTML = `
        <div class="avaliacao-card skeleton"></div>
        <div class="avaliacao-card skeleton"></div>
        <div class="avaliacao-card skeleton"></div>
    `;
    
    // Carregar avaliações
    fetch(`${API_URL}/avaliacoes`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            avaliacoesLista.innerHTML = '';
            
            if (data.data.length === 0) {
                avaliacoesLista.innerHTML = '<p>Nenhuma avaliação encontrada</p>';
            } else {
                data.data.forEach(avaliacao => {
                    const avaliacaoCard = document.createElement('div');
                    avaliacaoCard.className = 'avaliacao-card';
                    
                    // Criar estrelas
                    let estrelas = '';
                    for (let i = 1; i <= 5; i++) {
                        if (i <= avaliacao.nota) {
                            estrelas += '<i class="fas fa-star"></i>';
                        } else {
                            estrelas += '<i class="far fa-star"></i>';
                        }
                    }
                    
                    // Formatar data
                    const data = new Date(avaliacao.createdAt).toLocaleDateString('pt-BR');
                    
                    avaliacaoCard.innerHTML = `
                        <div class="avaliacao-header">
                            <span class="avaliacao-usuario">${avaliacao.usuario.nome}</span>
                            <span class="avaliacao-servico">${avaliacao.agendamento.servico.nome}</span>
                        </div>
                        <div class="avaliacao-estrelas">${estrelas}</div>
                        <p>${avaliacao.comentario}</p>
                        <div class="avaliacao-data">${data}</div>
                    `;
                    
                    avaliacoesLista.appendChild(avaliacaoCard);
                });
            }
        } else {
            avaliacoesLista.innerHTML = '<p>Erro ao carregar avaliações</p>';
        }
    })
    .catch(error => {
        console.error('Erro ao carregar avaliações:', error);
        avaliacoesLista.innerHTML = '<p>Erro ao carregar avaliações</p>';
    });
    
    // Configurar formulário de avaliação (apenas para usuários autenticados)
    if (token) {
        avaliacaoFormContainer.classList.remove('hidden');
        
        // Carregar agendamentos concluídos
        fetch(`${API_URL}/agendamentos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const agendamentosSelect = document.getElementById('agendamento-select');
                agendamentosSelect.innerHTML = '<option value="">Selecione um agendamento concluído</option>';
                
                // Filtrar apenas agendamentos concluídos
                const concluidos = data.data.filter(a => a.status === 'concluído');
                
                if (concluidos.length === 0) {
                    agendamentosSelect.innerHTML = '<option value="">Nenhum agendamento concluído</option>';
                    document.getElementById('enviar-avaliacao').disabled = true;
                } else {
                    concluidos.forEach(agendamento => {
                        const option = document.createElement('option');
                        option.value = agendamento._id;
                        
                        const data = new Date(agendamento.data).toLocaleDateString('pt-BR');
                        option.textContent = `${agendamento.servico.nome} - ${data} ${agendamento.horario}`;
                        
                        agendamentosSelect.appendChild(option);
                    });
                }
            }
        })
        .catch(error => {
            console.error('Erro ao carregar agendamentos:', error);
        });
        
        // Configurar estrelas
        const stars = document.querySelectorAll('.rating i');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = star.getAttribute('data-rating');
                document.getElementById('nota-avaliacao').value = rating;
                
                // Atualizar visual
                stars.forEach(s => {
                    const sRating = s.getAttribute('data-rating');
                    if (sRating <= rating) {
                        s.className = 'fas fa-star';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
            });
        });
        
        // Enviar avaliação
        document.getElementById('enviar-avaliacao').addEventListener('click', () => {
            const agendamento = document.getElementById('agendamento-select').value;
            const nota = document.getElementById('nota-avaliacao').value;
            const comentario = document.getElementById('comentario').value;
            
            if (!agendamento || nota === '0') {
                showAlert('Erro', 'Por favor, selecione um agendamento e dê uma nota');
                return;
            }
            
            fetch(`${API_URL}/avaliacoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    agendamento,
                    nota,
                    comentario
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Sucesso', 'Avaliação enviada com sucesso!');
                    loadAvaliacoes(); // Recarregar avaliações
                } else {
                    showAlert('Erro', data.error || 'Erro ao enviar avaliação');
                }
            })
            .catch(error => {
                console.error('Erro ao enviar avaliação:', error);
                showAlert('Erro', 'Ocorreu um erro ao enviar a avaliação. Tente novamente.');
            });
        });
    } else {
        avaliacaoFormContainer.classList.add('hidden');
    }
}

// Carregar perfil
function loadPerfil() {
    const perfilDados = document.getElementById('perfil-dados');
    const meusAgendamentos = document.getElementById('meus-agendamentos');
    
    // Mostrar skeletons enquanto carrega
    perfilDados.innerHTML = `
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
    `;
    
    meusAgendamentos.innerHTML = `
        <div class="agendamento-item skeleton"></div>
        <div class="agendamento-item skeleton"></div>
    `;
    
    // Carregar dados do perfil
    fetch(`${API_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = data.data;
            
            perfilDados.innerHTML = `
                <p><strong>Nome:</strong> ${currentUser.nome}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Telefone:</strong> ${currentUser.telefone}</p>
                <p><strong>Status do Email:</strong> ${currentUser.emailConfirmado ? 'Confirmado' : 'Não confirmado'}</p>
            `;
        } else {
            perfilDados.innerHTML = '<p>Erro ao carregar dados do perfil</p>';
        }
    })
    .catch(error => {
        console.error('Erro ao carregar dados do perfil:', error);
        perfilDados.innerHTML = '<p>Erro ao carregar dados do perfil</p>';
    });
    
    // Carregar agendamentos
    fetch(`${API_URL}/agendamentos`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            meusAgendamentos.innerHTML = '';
            
            if (data.data.length === 0) {
                meusAgendamentos.innerHTML = '<p>Nenhum agendamento encontrado</p>';
            } else {
                data.data.forEach(agendamento => {
                    const agendamentoItem = document.createElement('div');
                    agendamentoItem.className = 'agendamento-item';
                    
                    // Formatar data
                    const data = new Date(agendamento.data).toLocaleDateString('pt-BR');
                    
                    // Definir classe de status
                    let statusClass = '';
                    switch (agendamento.status) {
                        case 'agendado':
                            statusClass = 'status-agendado';
                            break;
                        case 'confirmado':
                            statusClass = 'status-confirmado';
                            break;
                        case 'cancelado':
                            statusClass = 'status-cancelado';
                            break;
                        case 'concluído':
                            statusClass = 'status-concluido';
                            break;
                    }
                    
                    agendamentoItem.innerHTML = `
                        <div class="agendamento-data">${data} - ${agendamento.horario}</div>
                        <div class="agendamento-servico">${agendamento.servico.nome} - R$ ${agendamento.servico.preco.toFixed(2)}</div>
                        <div class="agendamento-status ${statusClass}">${agendamento.status}</div>
                        <div class="agendamento-acoes">
                            ${agendamento.status === 'agendado' ? `<button class="btn btn-small cancelar-agendamento" data-id="${agendamento._id}">Cancelar</button>` : ''}
                            ${agendamento.status === 'concluído' && !agendamento.avaliado ? `<button class="btn btn-small btn-primary avaliar-agendamento" data-id="${agendamento._id}">Avaliar</button>` : ''}
                        </div>
                    `;
                    
                    meusAgendamentos.appendChild(agendamentoItem);
                });
                
                // Adicionar eventos aos botões
                document.querySelectorAll('.cancelar-agendamento').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const agendamentoId = btn.getAttribute('data-id');
                        
                        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                            fetch(`${API_URL}/agendamentos/${agendamentoId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    showAlert('Sucesso', 'Agendamento cancelado com sucesso!');
                                    loadPerfil(); // Recarregar perfil
                                } else {
                                    showAlert('Erro', data.error || 'Erro ao cancelar agendamento');
                                }
                            })
                            .catch(error => {
                                console.error('Erro ao cancelar agendamento:', error);
                                showAlert('Erro', 'Ocorreu um erro ao cancelar o agendamento. Tente novamente.');
                            });
                        }
                    });
                });
                
                document.querySelectorAll('.avaliar-agendamento').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const agendamentoId = btn.getAttribute('data-id');
                        navigateTo('avaliacoes');
                        
                        // Selecionar o agendamento no formulário de avaliação
                        setTimeout(() => {
                            document.getElementById('agendamento-select').value = agendamentoId;
                        }, 500);
                    });
                });
            }
        } else {
            meusAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos</p>';
        }
    })
    .catch(error => {
        console.error('Erro ao carregar agendamentos:', error);
        meusAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos</p>';
    });
}
