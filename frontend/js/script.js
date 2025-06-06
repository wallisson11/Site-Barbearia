/*
*   JavaScript para o site da Barbearia
*   Inclui funcionalidades de navegação, autenticação, agendamento, avaliações e painel admin.
*/

// Configuração da API
const API_URL = "."; // Usar caminho relativo para API no mesmo servidor
let token = localStorage.getItem("token");
let currentUser = null;

// Elementos DOM
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const confirmationModal = document.getElementById("confirmation-modal");
const alertModal = document.getElementById("alert-modal");
// const editServiceModal = document.getElementById("edit-service-modal"); // Será criado dinamicamente
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const perfilLink = document.getElementById("perfil-link");
const adminLinkLi = document.getElementById("admin-link-li"); // Link do painel admin
const agendarBtn = document.getElementById("agendar-btn");
const navLinks = document.querySelectorAll(".nav-link");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadHomePage();
  setupNavigation();
  setupModals();
  setupForms();
  setupResponsiveMenu();
});

// --- Autenticação ---
async function checkAuth() {
  token = localStorage.getItem("token"); // Garante que o token está atualizado
  if (token) {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        currentUser = data.data;
        updateAuthUI(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      logout();
    }
  } else {
    updateAuthUI(false);
  }
}

function updateAuthUI(isAuthenticated) {
  if (isAuthenticated && currentUser) {
    loginBtn.classList.add("hidden");
    registerBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    perfilLink.classList.remove("hidden");
    if (currentUser.role === "admin") {
      adminLinkLi.classList.remove("hidden");
    } else {
      adminLinkLi.classList.add("hidden");
    }
  } else {
    loginBtn.classList.remove("hidden");
    registerBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    perfilLink.classList.add("hidden");
    adminLinkLi.classList.add("hidden");
  }
}

function logout() {
  localStorage.removeItem("token");
  token = null;
  currentUser = null;
  updateAuthUI(false);
  navigateTo("home");
}

// --- Navegação ---
function setupNavigation() {
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      navigateTo(page);
    });
  });

  agendarBtn.addEventListener("click", () => {
    if (token) {
      navigateTo("agendamento");
    } else {
      showLoginModal();
    }
  });

  logoutBtn.addEventListener("click", logout);
}

function navigateTo(page) {
  if (page === "admin" && (!currentUser || currentUser.role !== "admin")) {
    showAlert("Acesso Negado", "Você não tem permissão para acessar esta página.");
    navigateTo("home");
    return;
  }

  if ((page === "perfil" || page === "agendamento") && !token) {
    showLoginModal();
    return;
  }

  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active");
  });

  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) {
    targetPage.classList.add("active");
  } else {
    console.error(`Página não encontrada: ${page}-page`);
    document.getElementById("home-page").classList.add("active");
  }

  nav.classList.remove("active");

  switch (page) {
    case "servicos":
      loadServicos();
      break;
    case "agendamento":
      loadAgendamentoForm();
      break;
    case "avaliacoes":
      loadAvaliacoes();
      break;
    case "perfil":
      loadPerfil();
      break;
    case "admin":
      loadAdminPanel();
      break;
  }
}

// --- Modais ---
function setupModals() {
  document.querySelectorAll(".modal .close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      closeBtn.closest(".modal").style.display = "none";
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });

  loginBtn.addEventListener("click", showLoginModal);
  registerBtn.addEventListener("click", () => {
    registerModal.style.display = "block";
  });

  document.getElementById("switch-to-register").addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.style.display = "none";
    registerModal.style.display = "block";
  });
  document.getElementById("switch-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    registerModal.style.display = "none";
    loginModal.style.display = "block";
  });

  document.getElementById("alert-ok").addEventListener("click", () => {
    alertModal.style.display = "none";
  });
}

function showLoginModal() {
  loginModal.style.display = "block";
}

function showAlert(title, message) {
  document.getElementById("alert-title").textContent = title;
  document.getElementById("alert-message").textContent = message;
  alertModal.style.display = "block";
}

// --- Formulários ---
function setupForms() {
  // Formulário de Login
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (data.success) {
        token = data.token;
        localStorage.setItem("token", token);
        loginModal.style.display = "none";
        await checkAuth();
        showAlert("Sucesso", "Login realizado com sucesso!");
        if (currentUser && currentUser.role === "admin") {
          navigateTo("admin");
        } else {
          navigateTo("perfil");
        }
      } else {
        showAlert("Erro", data.error || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      showAlert("Erro", "Ocorreu um erro ao fazer login. Tente novamente.");
    }
  });

  // Formulário de Cadastro
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("register-nome").value;
    const email = document.getElementById("register-email").value;
    const telefone = document.getElementById("register-telefone").value;
    const senha = document.getElementById("register-senha").value;
    const confirmarSenha = document.getElementById("register-confirmar-senha").value;

    if (senha !== confirmarSenha) {
      showAlert("Erro", "As senhas não coincidem");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, telefone, senha }),
      });
      const data = await response.json();
      if (data.success) {
        token = data.token;
        localStorage.setItem("token", token);
        registerModal.style.display = "none";
        await checkAuth();
        showAlert("Sucesso", "Cadastro realizado! Um e-mail de confirmação foi simulado no console.");
        navigateTo("perfil");
      } else {
        showAlert("Erro", data.error || "Erro ao cadastrar");
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      showAlert("Erro", "Ocorreu um erro ao cadastrar. Tente novamente.");
    }
  });

  // Formulário de Adicionar Serviço (Admin)
  const addServiceForm = document.getElementById("add-service-form");
  if (addServiceForm) {
    addServiceForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentUser || currentUser.role !== "admin") return;

      const formData = new FormData();
      formData.append("nome", document.getElementById("add-nome").value);
      formData.append("descricao", document.getElementById("add-descricao").value);
      formData.append("preco", parseFloat(document.getElementById("add-preco").value));
      formData.append("duracao", parseInt(document.getElementById("add-duracao").value));
      formData.append("tipo", document.getElementById("add-tipo").value);
      formData.append("disponivel", document.getElementById("add-disponivel").checked);

      const imagemInput = document.getElementById("add-imagem");
      if (imagemInput.files[0]) {
        formData.append("imagemServico", imagemInput.files[0]); // Nome do campo esperado pelo backend
      }

      try {
        // Não definir Content-Type, o browser faz isso para multipart/form-data
        const response = await fetch(`${API_URL}/api/servicos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          showAlert("Sucesso", "Serviço adicionado com sucesso!");
          addServiceForm.reset();
          loadAdminPanelServices();
        } else {
          showAlert("Erro", data.error || "Erro ao adicionar serviço");
        }
      } catch (error) {
        console.error("Erro ao adicionar serviço:", error);
        showAlert("Erro", "Ocorreu um erro na comunicação com a API.");
      }
    });
  }

  // Lógica para formulário de edição será adicionada em loadAdminPanelServices
}

// --- Menu Responsivo ---
function setupResponsiveMenu() {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

// --- Carregamento de Conteúdo das Páginas ---
function loadHomePage() {
  // Conteúdo estático
}

async function loadServicos() {
  const servicosLista = document.getElementById("servicos-lista");
  servicosLista.innerHTML = `
        <div class="servico-card skeleton"></div>
        <div class="servico-card skeleton"></div>
        <div class="servico-card skeleton"></div>
    `;

  try {
    const response = await fetch(`${API_URL}/api/servicos`);
    const data = await response.json();
    if (data.success) {
      servicosLista.innerHTML = "";
      data.data.forEach((servico) => {
        if (!servico.disponivel) return;

        const servicoCard = document.createElement("div");
        servicoCard.className = "servico-card";
        // Usar a imagem do serviço ou a padrão
        const imagemUrl = servico.imagem ? `${API_URL}/uploads/servicos/${servico.imagem}` : `${API_URL}/uploads/servicos/default-servico.jpg`;

        servicoCard.innerHTML = `
                    <div class="servico-img" style="background-image: url(\'${imagemUrl}\')"></div>
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

      document.querySelectorAll(".agendar-servico").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (token) {
            const servicoId = btn.getAttribute("data-id");
            navigateTo("agendamento");
            setTimeout(() => {
              const servicoSelect = document.getElementById("servico-select");
              if (servicoSelect) servicoSelect.value = servicoId;
            }, 100);
          } else {
            showLoginModal();
          }
        });
      });
    } else {
      servicosLista.innerHTML = "<p>Erro ao carregar serviços</p>";
    }
  } catch (error) {
    console.error("Erro ao carregar serviços:", error);
    servicosLista.innerHTML = "<p>Erro de comunicação ao carregar serviços</p>";
  }
}

async function loadAgendamentoForm() {
  const servicoSelect = document.getElementById("servico-select");
  const horarioSelect = document.getElementById("horario-select");
  const dataAgendamento = document.getElementById("data-agendamento");
  const imagemReferencia = document.getElementById("imagem-referencia");
  const previewContainer = document.getElementById("preview-container");
  const imagemPreview = document.getElementById("imagem-preview");
  const removerImagem = document.getElementById("remover-imagem");
  const confirmarAgendamento = document.getElementById("confirmar-agendamento");

  servicoSelect.innerHTML = 
    '<option value="">Carregando serviços...</option>';
  horarioSelect.innerHTML = 
    '<option value="">Carregando horários...</option>';
  dataAgendamento.value = "";
  imagemReferencia.value = "";
  previewContainer.classList.add("hidden");
  document.getElementById("observacoes").value = "";

  const hoje = new Date();
  const dataMinima = hoje.toISOString().split("T")[0];
  dataAgendamento.setAttribute("min", dataMinima);

  try {
    const [servicosRes, horariosRes] = await Promise.all([
      fetch(`${API_URL}/api/servicos`),
      fetch(`${API_URL}/api/horarios`), 
    ]);

    const servicosData = await servicosRes.json();
    servicoSelect.innerHTML = 
      '<option value="">Selecione um serviço</option>';
    if (servicosData.success) {
      servicosData.data.forEach((servico) => {
        if (!servico.disponivel) return;
        const option = document.createElement("option");
        option.value = servico._id;
        option.textContent = `${servico.nome} - R$ ${servico.preco.toFixed(2)}`;
        servicoSelect.appendChild(option);
      });
    } else {
      servicoSelect.innerHTML = 
        '<option value="">Erro ao carregar</option>';
    }

    const horariosData = await horariosRes.json();
    horarioSelect.innerHTML = 
      '<option value="">Selecione um horário</option>';
    if (horariosData.success) {
      horariosData.data.forEach((horario) => {
        const option = document.createElement("option");
        option.value = horario;
        option.textContent = horario;
        horarioSelect.appendChild(option);
      });
    } else {
      horarioSelect.innerHTML = 
        '<option value="">Erro ao carregar</option>';
    }
  } catch (error) {
    console.error("Erro ao carregar dados de agendamento:", error);
    servicoSelect.innerHTML = 
      '<option value="">Erro de comunicação</option>';
    horarioSelect.innerHTML = 
      '<option value="">Erro de comunicação</option>';
  }

  // Preview da imagem de referência
  imagemReferencia.addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imagemPreview.src = e.target.result;
        previewContainer.classList.remove("hidden");
      }
      reader.readAsDataURL(file);
    } else {
      previewContainer.classList.add("hidden");
    }
  });

  removerImagem.addEventListener("click", () => {
    imagemReferencia.value = "";
    previewContainer.classList.add("hidden");
    imagemPreview.src = "#";
  });

  // Lógica de confirmação (abre modal)
  confirmarAgendamento.addEventListener("click", () => {
    const servicoId = servicoSelect.value;
    const data = dataAgendamento.value;
    const horario = horarioSelect.value;

    if (!servicoId || !data || !horario) {
      showAlert("Erro", "Por favor, preencha todos os campos obrigatórios (serviço, data e horário).");
      return;
    }

    const servicoSelecionado = servicoSelect.options[servicoSelect.selectedIndex].text;
    const detalhes = `
            <p><strong>Serviço:</strong> ${servicoSelecionado}</p>
            <p><strong>Data:</strong> ${new Date(data + 'T00:00:00').toLocaleDateString()}</p>
            <p><strong>Horário:</strong> ${horario}</p>
            <p><strong>Observações:</strong> ${document.getElementById("observacoes").value || 'Nenhuma'}</p>
        `;
    document.getElementById("confirmation-details").innerHTML = detalhes;
    confirmationModal.style.display = "block";
  });

  // Lógica de confirmação final (envia para API)
  document.getElementById("confirmar-final").addEventListener("click", async () => {
    const servicoId = servicoSelect.value;
    const data = dataAgendamento.value;
    const horario = horarioSelect.value;
    const observacoes = document.getElementById("observacoes").value;
    const imagemFile = imagemReferencia.files[0];

    if (!servicoId || !data || !horario) return; // Já validado antes

    try {
      // 1. Criar o agendamento
      const agendamentoResponse = await fetch(`${API_URL}/api/agendamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ servico: servicoId, data, horario, observacoes }),
      });
      const agendamentoData = await agendamentoResponse.json();

      if (!agendamentoData.success) {
        throw new Error(agendamentoData.error || "Erro ao criar agendamento");
      }

      const agendamentoId = agendamentoData.data._id;

      // 2. Se houver imagem, fazer upload
      if (imagemFile) {
        const formData = new FormData();
        formData.append("imagem", imagemFile); // Nome do campo esperado pelo backend

        const imagemResponse = await fetch(`${API_URL}/api/agendamentos/${agendamentoId}/imagem`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const imagemData = await imagemResponse.json();
        if (!imagemData.success) {
          // Mesmo que o upload falhe, o agendamento foi criado
          console.warn("Agendamento criado, mas erro ao fazer upload da imagem:", imagemData.error);
          showAlert("Aviso", `Agendamento confirmado, mas houve um erro ao enviar a imagem: ${imagemData.error}`);
        } else {
          showAlert("Sucesso", "Agendamento confirmado e imagem enviada!");
        }
      } else {
        showAlert("Sucesso", "Agendamento confirmado!");
      }

      confirmationModal.style.display = "none";
      navigateTo("perfil"); // Vai para o perfil após agendar

    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      showAlert("Erro", `Ocorreu um erro: ${error.message}`);
      confirmationModal.style.display = "none";
    }
  });

  document.getElementById("cancelar-agendamento").addEventListener("click", () => {
    confirmationModal.style.display = "none";
  });
}

async function loadAvaliacoes() {
  const avaliacoesLista = document.getElementById("avaliacoes-lista");
  const avaliacaoFormContainer = document.getElementById("avaliacao-form-container");
  const agendamentoSelect = document.getElementById("agendamento-select");
  const ratingStars = document.querySelectorAll(".rating i");
  const notaInput = document.getElementById("nota-avaliacao");
  const comentarioInput = document.getElementById("comentario");
  const enviarAvaliacaoBtn = document.getElementById("enviar-avaliacao");

  avaliacoesLista.innerHTML = `
        <div class="avaliacao-card skeleton"></div>
        <div class="avaliacao-card skeleton"></div>
    `;
  avaliacaoFormContainer.classList.add("hidden");

  // Carregar avaliações existentes
  try {
    const response = await fetch(`${API_URL}/api/avaliacoes`);
    const data = await response.json();
    avaliacoesLista.innerHTML = "";
    if (data.success && data.data.length > 0) {
      data.data.forEach((avaliacao) => {
        const card = document.createElement("div");
        card.className = "avaliacao-card";
        card.innerHTML = `
                    <div class="avaliacao-header">
                        <strong>${avaliacao.usuario ? avaliacao.usuario.nome : 'Usuário Anônimo'}</strong>
                        <span class="avaliacao-nota">${'<i class="fas fa-star"></i>'.repeat(avaliacao.nota)}${'<i class="far fa-star"></i>'.repeat(5 - avaliacao.nota)}</span>
                    </div>
                    <p>${avaliacao.comentario || "Sem comentário"}</p>
                    <small>Serviço: ${avaliacao.agendamento && avaliacao.agendamento.servico ? avaliacao.agendamento.servico.nome : 'Não informado'} - ${new Date(avaliacao.createdAt).toLocaleDateString()}</small>
                `;
        avaliacoesLista.appendChild(card);
      });
    } else if (data.success) {
      avaliacoesLista.innerHTML = "<p>Ainda não há avaliações.</p>";
    } else {
      avaliacoesLista.innerHTML = "<p>Erro ao carregar avaliações.</p>";
    }
  } catch (error) {
    console.error("Erro ao carregar avaliações:", error);
    avaliacoesLista.innerHTML = "<p>Erro de comunicação ao carregar avaliações.</p>";
  }

  // Carregar agendamentos concluídos para avaliação (se logado)
  if (token) {
    try {
      const response = await fetch(`${API_URL}/api/agendamentos?status=concluido&avaliado=false`, { // Adicionar filtros na API
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      agendamentoSelect.innerHTML = '<option value="">Selecione um agendamento concluído</option>';
      if (data.success && data.data.length > 0) {
        data.data.forEach(ag => {
          const option = document.createElement("option");
          option.value = ag._id;
          option.textContent = `${ag.servico.nome} - ${new Date(ag.data).toLocaleDateString()} ${ag.horario}`;
          agendamentoSelect.appendChild(option);
        });
        avaliacaoFormContainer.classList.remove("hidden");
      } else {
        // Não mostra o form se não houver agendamentos para avaliar
        avaliacaoFormContainer.classList.add("hidden");
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos para avaliação:", error);
    }
  }

  // Lógica do Rating
  ratingStars.forEach(star => {
    star.addEventListener("click", () => {
      const rating = star.getAttribute("data-rating");
      notaInput.value = rating;
      ratingStars.forEach(s => {
        s.classList.remove("fas");
        s.classList.add("far");
        if (parseInt(s.getAttribute("data-rating")) <= parseInt(rating)) {
          s.classList.remove("far");
          s.classList.add("fas");
        }
      });
    });
  });

  // Enviar Avaliação
  enviarAvaliacaoBtn.addEventListener("click", async () => {
    const agendamentoId = agendamentoSelect.value;
    const nota = parseInt(notaInput.value);
    const comentario = comentarioInput.value;

    if (!agendamentoId || nota === 0) {
      showAlert("Erro", "Selecione um agendamento e dê uma nota.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agendamento: agendamentoId, nota, comentario }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Sucesso", "Avaliação enviada com sucesso!");
        // Limpar form e recarregar avaliações e agendamentos
        notaInput.value = 0;
        comentarioInput.value = "";
        ratingStars.forEach(s => { s.classList.remove("fas"); s.classList.add("far"); });
        loadAvaliacoes();
      } else {
        showAlert("Erro", data.error || "Erro ao enviar avaliação.");
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      showAlert("Erro", "Erro de comunicação ao enviar avaliação.");
    }
  });
}

async function loadPerfil() {
  const perfilDados = document.getElementById("perfil-dados");
  const meusAgendamentos = document.getElementById("meus-agendamentos");

  perfilDados.innerHTML = `
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
    `;
  meusAgendamentos.innerHTML = `
        <div class="agendamento-item skeleton"></div>
    `;

  if (!currentUser) {
    await checkAuth(); // Garante que currentUser está carregado
    if (!currentUser) {
      perfilDados.innerHTML = "<p>Erro ao carregar dados do perfil.</p>";
      meusAgendamentos.innerHTML = "";
      return;
    }
  }

  // Exibir dados do perfil
  perfilDados.innerHTML = `
        <p><strong>Nome:</strong> ${currentUser.nome}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Telefone:</strong> ${currentUser.telefone || 'Não informado'}</p>
        <p><strong>Membro desde:</strong> ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
        <p><strong>Status E-mail:</strong> ${currentUser.emailConfirmado ? 'Confirmado' : 'Pendente'}</p>
    `;

  // Carregar agendamentos do usuário
  try {
    const response = await fetch(`${API_URL}/api/agendamentos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    meusAgendamentos.innerHTML = "";
    if (data.success && data.data.length > 0) {
      data.data.forEach(ag => {
        const item = document.createElement("div");
        item.className = "agendamento-item";
        const imagemReferenciaHtml = ag.imagemReferencia
          ? `<p><strong>Imagem Referência:</strong> <a href="${API_URL}/uploads/referencias/${ag.imagemReferencia}" target="_blank">Ver Imagem</a></p>`
          : '';

        item.innerHTML = `
                    <h4>${ag.servico.nome}</h4>
                    <p><strong>Data:</strong> ${new Date(ag.data).toLocaleDateString()} às ${ag.horario}</p>
                    <p><strong>Status:</strong> <span class="status-${ag.status}">${ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}</span></p>
                    <p><strong>Observações:</strong> ${ag.observacoes || 'Nenhuma'}</p>
                    ${imagemReferenciaHtml}
                `;
        // Adicionar botão de cancelar se status for 'agendado'
        if (ag.status === 'agendado') {
          const cancelButton = document.createElement('button');
          cancelButton.className = 'btn btn-small btn-cancelar';
          cancelButton.textContent = 'Cancelar';
          cancelButton.dataset.id = ag._id;
          cancelButton.addEventListener('click', () => cancelarAgendamento(ag._id));
          item.appendChild(cancelButton);
        }
        meusAgendamentos.appendChild(item);
      });
    } else if (data.success) {
      meusAgendamentos.innerHTML = "<p>Você ainda não possui agendamentos.</p>";
    } else {
      meusAgendamentos.innerHTML = "<p>Erro ao carregar agendamentos.</p>";
    }
  } catch (error) {
    console.error("Erro ao carregar agendamentos do perfil:", error);
    meusAgendamentos.innerHTML = "<p>Erro de comunicação ao carregar agendamentos.</p>";
  }
}

// --- Funções Auxiliares ---
async function cancelarAgendamento(id) {
  if (!confirm("Tem certeza que deseja cancelar este agendamento?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/agendamentos/${id}`, {
      method: 'PUT', // Ou DELETE, dependendo da API
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'cancelado' }) // Se for PUT
    });
    const data = await response.json();
    if (data.success) {
      showAlert('Sucesso', 'Agendamento cancelado.');
      loadPerfil(); // Recarrega o perfil
    } else {
      showAlert('Erro', data.error || 'Não foi possível cancelar o agendamento.');
    }
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    showAlert('Erro', 'Erro de comunicação ao cancelar.');
  }
}

// --- Painel Administrativo ---
async function loadAdminPanel() {
  if (!currentUser || currentUser.role !== "admin") {
    navigateTo("home");
    return;
  }
  loadAdminPanelServices();
}

async function loadAdminPanelServices() {
  const tableBody = document.getElementById("services-table-body");
  tableBody.innerHTML = '<tr><td colspan="6">Carregando serviços...</td></tr>';

  try {
    const response = await fetch(`${API_URL}/api/servicos`);
    const data = await response.json();
    tableBody.innerHTML = ""; // Limpa o corpo da tabela

    if (data.success && data.data.length > 0) {
      data.data.forEach(servico => {
        const row = tableBody.insertRow();
        row.innerHTML = `
                    <td>${servico.nome}</td>
                    <td>R$ ${servico.preco.toFixed(2)}</td>
                    <td>${servico.duracao} min</td>
                    <td>${servico.tipo}</td>
                    <td>${servico.disponivel ? 'Sim' : 'Não'}</td>
                    <td>
                        <button class="btn btn-small btn-edit" data-id="${servico._id}">Editar</button>
                        <button class="btn btn-small btn-delete" data-id="${servico._id}">Excluir</button>
                    </td>
                `;
      });

      // Adicionar listeners para botões de editar e excluir
      tableBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editService(btn.dataset.id));
      });
      tableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteService(btn.dataset.id));
      });

    } else if (data.success) {
      tableBody.innerHTML = '<tr><td colspan="6">Nenhum serviço cadastrado.</td></tr>';
    } else {
      tableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar serviços.</td></tr>';
    }
  } catch (error) {
    console.error("Erro ao carregar serviços no painel admin:", error);
    tableBody.innerHTML = '<tr><td colspan="6">Erro de comunicação.</td></tr>';
  }
}

async function editService(id) {
  // Buscar dados do serviço específico
  try {
    const response = await fetch(`${API_URL}/api/servicos/${id}`);
    const data = await response.json();
    if (!data.success) {
      showAlert('Erro', 'Não foi possível carregar os dados do serviço.');
      return;
    }
    const servico = data.data;

    // Criar ou obter modal de edição
    let modal = document.getElementById('edit-service-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'edit-service-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }

    // Preencher modal com formulário de edição
    modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Editar Serviço</h2>
                <form id="edit-service-form" class="admin-form">
                    <input type="hidden" id="edit-id" value="${servico._id}">
                    <div class="form-group">
                        <label for="edit-nome">Nome:</label>
                        <input type="text" id="edit-nome" value="${servico.nome}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-descricao">Descrição:</label>
                        <textarea id="edit-descricao" rows="3" required>${servico.descricao}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-preco">Preço (R$):</label>
                        <input type="number" id="edit-preco" step="0.01" value="${servico.preco}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-duracao">Duração (minutos):</label>
                        <input type="number" id="edit-duracao" value="${servico.duracao}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-tipo">Tipo:</label>
                        <select id="edit-tipo" required>
                            <option value="corte" ${servico.tipo === 'corte' ? 'selected' : ''}>Corte</option>
                            <option value="barba" ${servico.tipo === 'barba' ? 'selected' : ''}>Barba</option>
                            <option value="combo" ${servico.tipo === 'combo' ? 'selected' : ''}>Combo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-disponivel">Disponível:</label>
                        <input type="checkbox" id="edit-disponivel" ${servico.disponivel ? 'checked' : ''}>
                    </div>
                     <div class="form-group">
                        <label for="edit-imagem">Imagem Atual:</label>
                        <img src="${API_URL}/uploads/servicos/${servico.imagem || 'default-servico.jpg'}" alt="Imagem atual" style="max-width: 100px; display: block; margin-bottom: 5px;">
                        <label for="edit-imagem-new">Nova Imagem (opcional):</label>
                        <input type="file" id="edit-imagem-new" accept="image/*">
                    </div>
                    <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                </form>
            </div>
        `;

    // Adicionar listeners para fechar e submeter
    modal.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
    modal.querySelector('#edit-service-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("nome", document.getElementById("edit-nome").value);
      formData.append("descricao", document.getElementById("edit-descricao").value);
      formData.append("preco", parseFloat(document.getElementById("edit-preco").value));
      formData.append("duracao", parseInt(document.getElementById("edit-duracao").value));
      formData.append("tipo", document.getElementById("edit-tipo").value);
      formData.append("disponivel", document.getElementById("edit-disponivel").checked);

      const novaImagemInput = document.getElementById("edit-imagem-new");
      if (novaImagemInput.files[0]) {
        formData.append("imagemServico", novaImagemInput.files[0]);
      }

      try {
        const response = await fetch(`${API_URL}/api/servicos/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          showAlert('Sucesso', 'Serviço atualizado com sucesso!');
          modal.style.display = 'none';
          loadAdminPanelServices(); // Recarrega a tabela
        } else {
          showAlert('Erro', data.error || 'Erro ao atualizar serviço.');
        }
      } catch (error) {
        console.error("Erro ao atualizar serviço:", error);
        showAlert('Erro', 'Erro de comunicação ao atualizar.');
      }
    });

    modal.style.display = 'block'; // Mostra o modal

  } catch (error) {
    console.error("Erro ao buscar serviço para edição:", error);
    showAlert('Erro', 'Erro de comunicação ao buscar dados do serviço.');
  }
}

async function deleteService(id) {
  if (!confirm("Tem certeza que deseja excluir este serviço?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/servicos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const data = await response.json();
    if (data.success) {
      showAlert('Sucesso', 'Serviço excluído com sucesso!');
      loadAdminPanelServices(); // Recarrega a tabela
    } else {
      showAlert('Erro', data.error || 'Erro ao excluir serviço.');
    }
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    showAlert('Erro', 'Erro de comunicação ao excluir.');
  }
}

