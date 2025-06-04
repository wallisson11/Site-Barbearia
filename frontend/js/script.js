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
const editServiceModal = document.getElementById("edit-service-modal"); // Adicionado para edição
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
        // Se o token for inválido (401), faz logout
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
      logout(); // Faz logout em caso de erro de rede ou outro
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
    // Mostra o link do admin se o usuário for admin
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
  // showAlert("Logout", "Você saiu da sua conta"); // Opcional
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
  // Verifica permissão para página admin
  if (page === "admin" && (!currentUser || currentUser.role !== "admin")) {
    showAlert("Acesso Negado", "Você não tem permissão para acessar esta página.");
    navigateTo("home"); // Redireciona para home
    return;
  }

  // Verifica se precisa estar logado para perfil ou agendamento
  if ((page === "perfil" || page === "agendamento") && !token) {
    showLoginModal();
    // Não muda de página se não estiver logado
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
    document.getElementById("home-page").classList.add("active"); // Volta para home
  }

  nav.classList.remove("active");

  // Carrega conteúdo dinâmico
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
      loadAdminPanel(); // Carrega o painel admin
      break;
  }
}

// --- Modais ---
function setupModals() {
  // Fechar modais
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

  // Alternar entre login e cadastro
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
        await checkAuth(); // Espera a verificação para ter currentUser
        showAlert("Sucesso", "Login realizado com sucesso!");
        // Redireciona para o painel se for admin, senão para o perfil
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
        navigateTo("perfil"); // Vai para o perfil após cadastro
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

      const servicoData = {
        nome: document.getElementById("add-nome").value,
        descricao: document.getElementById("add-descricao").value,
        preco: parseFloat(document.getElementById("add-preco").value),
        duracao: parseInt(document.getElementById("add-duracao").value),
        tipo: document.getElementById("add-tipo").value,
        disponivel: document.getElementById("add-disponivel").checked,
      };

      try {
        const response = await fetch(`${API_URL}/api/servicos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(servicoData),
        });
        const data = await response.json();
        if (data.success) {
          showAlert("Sucesso", "Serviço adicionado com sucesso!");
          addServiceForm.reset(); // Limpa o formulário
          loadAdminPanelServices(); // Recarrega a tabela
        } else {
          showAlert("Erro", data.error || "Erro ao adicionar serviço");
        }
      } catch (error) {
        console.error("Erro ao adicionar serviço:", error);
        showAlert("Erro", "Ocorreu um erro na comunicação com a API.");
      }
    });
  }
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
        if (!servico.disponivel) return; // Não mostra serviços indisponíveis

        const servicoCard = document.createElement("div");
        servicoCard.className = "servico-card";
        let imagemUrl = "../assets/default.jpg"; // Imagem padrão
        // Você pode adicionar lógica para imagens específicas por tipo se tiver os assets
        // switch (servico.tipo) { ... }

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
            // Preenche o select após a navegação
            setTimeout(() => {
              const servicoSelect = document.getElementById("servico-select");
              if (servicoSelect) servicoSelect.value = servicoId;
            }, 100); // Pequeno delay para garantir que a página carregou
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

  // Limpar formulário
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

  // Carregar Serviços e Horários em paralelo
  try {
    const [servicosRes, horariosRes] = await Promise.all([
      fetch(`${API_URL}/api/servicos`),
      fetch(`${API_URL}/api/horarios`), // Assumindo que /api/horarios existe
    ]);

    // Processar Serviços
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

    // Processar Horários
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

  // Preview de imagem
  imagemReferencia.onchange = () => {
    const file = imagemReferencia.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagemPreview.src = e.target.result;
        previewContainer.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  };

  removerImagem.onclick = () => {
    imagemReferencia.value = "";
    previewContainer.classList.add("hidden");
  };

  // Evento de clique para confirmar (apenas abre o modal)
  confirmarAgendamento.onclick = () => {
    const servico = servicoSelect.value;
    const data = dataAgendamento.value;
    const horario = horarioSelect.value;
    const observacoes = document.getElementById("observacoes").value;

    if (!servico || !data || !horario) {
      showAlert("Erro", "Por favor, preencha serviço, data e horário.");
      return;
    }

    const servicoText = servicoSelect.options[servicoSelect.selectedIndex].text;
    const dataObj = new Date(data + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso
    const dataFormatada = dataObj.toLocaleDateString("pt-BR", { timeZone: "UTC" });

    document.getElementById("confirmation-details").innerHTML = `
            <p><strong>Serviço:</strong> ${servicoText}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Horário:</strong> ${horario}</p>
            <p><strong>Observações:</strong> ${observacoes || "Nenhuma"}</p>
        `;
    confirmationModal.style.display = "block";
  };

  // Evento de clique no botão final de confirmação (dentro do modal)
  document.getElementById("confirmar-final").onclick = async () => {
    const servico = servicoSelect.value;
    const data = dataAgendamento.value;
    const horario = horarioSelect.value;
    const observacoes = document.getElementById("observacoes").value;
    const imagemFile = imagemReferencia.files[0];

    confirmationModal.style.display = "none"; // Fecha o modal

    try {
      // 1. Cria o agendamento
      const agendamentoRes = await fetch(`${API_URL}/api/agendamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ servico, data, horario, observacoes }),
      });
      const agendamentoData = await agendamentoRes.json();

      if (!agendamentoData.success) {
        throw new Error(agendamentoData.error || "Erro ao criar agendamento");
      }

      const agendamentoId = agendamentoData.data._id;

      // 2. Se houver imagem, faz o upload
      if (imagemFile) {
        const formData = new FormData();
        formData.append("imagem", imagemFile);

        const uploadRes = await fetch(`${API_URL}/api/agendamentos/${agendamentoId}/imagem`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          // Mesmo se o upload falhar, o agendamento foi criado
          showAlert("Aviso", "Agendamento realizado, mas erro ao enviar imagem.");
        } else {
          showAlert("Sucesso", "Agendamento e upload realizados com sucesso!");
        }
      } else {
        showAlert("Sucesso", "Agendamento realizado com sucesso!");
      }

      navigateTo("perfil"); // Redireciona para o perfil
    } catch (error) {
      console.error("Erro no processo de agendamento:", error);
      showAlert("Erro", `Falha no agendamento: ${error.message}`);
    }
  };

  document.getElementById("cancelar-agendamento").onclick = () => {
    confirmationModal.style.display = "none";
  };
}

async function loadAvaliacoes() {
  const avaliacoesLista = document.getElementById("avaliacoes-lista");
  const avaliacaoFormContainer = document.getElementById("avaliacao-form-container");

  avaliacoesLista.innerHTML = `
        <div class="avaliacao-card skeleton"></div>
        <div class="avaliacao-card skeleton"></div>
    `;

  try {
    const response = await fetch(`${API_URL}/api/avaliacoes`);
    const data = await response.json();
    avaliacoesLista.innerHTML = "";
    if (data.success) {
      if (data.data.length === 0) {
        avaliacoesLista.innerHTML = "<p>Nenhuma avaliação encontrada.</p>";
      } else {
        data.data.forEach((avaliacao) => {
          const avaliacaoCard = document.createElement("div");
          avaliacaoCard.className = "avaliacao-card";
          let estrelas = "";
          for (let i = 1; i <= 5; i++) {
            estrelas += `<i class="${i <= avaliacao.nota ? "fas" : "far"} fa-star"></i>`;
          }
          const dataFormatada = new Date(avaliacao.createdAt).toLocaleDateString("pt-BR");
          const nomeServico = avaliacao.agendamento?.servico?.nome || "Serviço não encontrado";

          avaliacaoCard.innerHTML = `
                        <div class="avaliacao-header">
                            <span class="avaliacao-usuario">${avaliacao.usuario?.nome || "Usuário anônimo"}</span>
                            <span class="avaliacao-servico">(${nomeServico})</span>
                        </div>
                        <div class="avaliacao-estrelas">${estrelas}</div>
                        <p>${avaliacao.comentario || "Sem comentário"}</p>
                        <div class="avaliacao-data">${dataFormatada}</div>
                    `;
          avaliacoesLista.appendChild(avaliacaoCard);
        });
      }
    } else {
      avaliacoesLista.innerHTML = "<p>Erro ao carregar avaliações.</p>";
    }
  } catch (error) {
    console.error("Erro ao carregar avaliações:", error);
    avaliacoesLista.innerHTML = "<p>Erro de comunicação ao carregar avaliações.</p>";
  }

  // Configurar formulário de avaliação se logado
  if (token) {
    avaliacaoFormContainer.classList.remove("hidden");
    const agendamentosSelect = document.getElementById("agendamento-select");
    const notaInput = document.getElementById("nota-avaliacao");
    const comentarioInput = document.getElementById("comentario");
    const enviarBtn = document.getElementById("enviar-avaliacao");
    const stars = document.querySelectorAll(".rating i");

    // Resetar formulário
    agendamentosSelect.innerHTML = 
      '<option value="">Carregando agendamentos...</option>';
    notaInput.value = "0";
    comentarioInput.value = "";
    stars.forEach(s => s.className = "far fa-star");

    // Carregar agendamentos concluídos
    try {
      const response = await fetch(`${API_URL}/api/agendamentos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      agendamentosSelect.innerHTML = 
        '<option value="">Selecione um agendamento concluído</option>';
      if (data.success) {
        const concluidos = data.data.filter((a) => a.status === "concluído");
        if (concluidos.length === 0) {
          agendamentosSelect.innerHTML = 
            '<option value="">Nenhum agendamento concluído</option>';
          enviarBtn.disabled = true;
        } else {
          enviarBtn.disabled = false;
          concluidos.forEach((agendamento) => {
            // TODO: Verificar se já foi avaliado antes de adicionar
            const option = document.createElement("option");
            option.value = agendamento._id;
            const dataFormatada = new Date(agendamento.data).toLocaleDateString("pt-BR");
            option.textContent = `${agendamento.servico.nome} - ${dataFormatada}`;
            agendamentosSelect.appendChild(option);
          });
        }
      } else {
        agendamentosSelect.innerHTML = 
          '<option value="">Erro ao carregar</option>';
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos para avaliação:", error);
      agendamentosSelect.innerHTML = 
        '<option value="">Erro de comunicação</option>';
    }

    // Lógica das estrelas
    stars.forEach((star) => {
      star.onclick = () => {
        const rating = star.getAttribute("data-rating");
        notaInput.value = rating;
        stars.forEach((s) => {
          s.className = s.getAttribute("data-rating") <= rating ? "fas fa-star" : "far fa-star";
        });
      };
    });

    // Enviar avaliação
    enviarBtn.onclick = async () => {
      const agendamento = agendamentosSelect.value;
      const nota = notaInput.value;
      const comentario = comentarioInput.value;

      if (!agendamento || nota === "0") {
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
          body: JSON.stringify({ agendamento, nota, comentario }),
        });
        const data = await response.json();
        if (data.success) {
          showAlert("Sucesso", "Avaliação enviada com sucesso!");
          loadAvaliacoes(); // Recarrega a lista
        } else {
          showAlert("Erro", data.error || "Erro ao enviar avaliação (talvez já avaliado?)");
        }
      } catch (error) {
        console.error("Erro ao enviar avaliação:", error);
        showAlert("Erro", "Ocorreu um erro na comunicação ao enviar avaliação.");
      }
    };
  } else {
    avaliacaoFormContainer.classList.add("hidden");
  }
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

  try {
    // Carrega dados do usuário e agendamentos em paralelo
    const [userRes, agendamentosRes] = await Promise.all([
      fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/api/agendamentos`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    // Processa dados do usuário
    const userData = await userRes.json();
    if (userData.success) {
      currentUser = userData.data; // Atualiza currentUser globalmente
      perfilDados.innerHTML = `
                <p><strong>Nome:</strong> ${currentUser.nome}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Telefone:</strong> ${currentUser.telefone || "Não informado"}</p>
                <p><strong>Status Email:</strong> ${currentUser.emailConfirmado ? "Confirmado" : "Não Confirmado"}</p>
            `;
    } else {
      perfilDados.innerHTML = "<p>Erro ao carregar dados do perfil.</p>";
    }

    // Processa agendamentos
    const agendamentosData = await agendamentosRes.json();
    meusAgendamentos.innerHTML = "";
    if (agendamentosData.success) {
      if (agendamentosData.data.length === 0) {
        meusAgendamentos.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
      } else {
        agendamentosData.data.sort((a, b) => new Date(b.data) - new Date(a.data)); // Ordena por data
        agendamentosData.data.forEach((agendamento) => {
          const agendamentoItem = document.createElement("div");
          agendamentoItem.className = "agendamento-item";
          const dataFormatada = new Date(agendamento.data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
          const statusClass = `status-${agendamento.status.replace("í", "i").toLowerCase()}`;

          agendamentoItem.innerHTML = `
                        <div class="agendamento-data">${dataFormatada} - ${agendamento.horario}</div>
                        <div class="agendamento-servico">${agendamento.servico?.nome || "Serviço indisponível"}</div>
                        <div class="agendamento-status ${statusClass}">${agendamento.status}</div>
                        <div class="agendamento-acoes">
                            ${agendamento.status === "agendado" ? `<button class="btn btn-small cancelar-agendamento" data-id="${agendamento._id}">Cancelar</button>` : ""}
                            ${agendamento.status === "concluído" ? `<button class="btn btn-small btn-primary avaliar-agendamento" data-id="${agendamento._id}">Avaliar</button>` : ""}
                        </div>
                    `;
          meusAgendamentos.appendChild(agendamentoItem);
        });

        // Adiciona eventos aos botões após criar os elementos
        setupPerfilAgendamentoActions();
      }
    } else {
      meusAgendamentos.innerHTML = "<p>Erro ao carregar agendamentos.</p>";
    }
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    perfilDados.innerHTML = "<p>Erro de comunicação ao carregar perfil.</p>";
    meusAgendamentos.innerHTML = "<p>Erro de comunicação ao carregar agendamentos.</p>";
  }
}

function setupPerfilAgendamentoActions() {
  // Cancelar Agendamento
  document.querySelectorAll(".cancelar-agendamento").forEach((btn) => {
    btn.onclick = async () => {
      const agendamentoId = btn.getAttribute("data-id");
      if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
        try {
          const response = await fetch(`${API_URL}/api/agendamentos/${agendamentoId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.success) {
            showAlert("Sucesso", "Agendamento cancelado.");
            loadPerfil(); // Recarrega o perfil
          } else {
            showAlert("Erro", data.error || "Erro ao cancelar.");
          }
        } catch (error) {
          console.error("Erro ao cancelar agendamento:", error);
          showAlert("Erro", "Erro de comunicação ao cancelar.");
        }
      }
    };
  });

  // Avaliar Agendamento
  document.querySelectorAll(".avaliar-agendamento").forEach((btn) => {
    btn.onclick = () => {
      const agendamentoId = btn.getAttribute("data-id");
      navigateTo("avaliacoes");
      // Preenche o select após a navegação
      setTimeout(() => {
        const agendamentoSelect = document.getElementById("agendamento-select");
        if (agendamentoSelect) agendamentoSelect.value = agendamentoId;
      }, 100);
    };
  });
}

// --- Painel Admin ---
function loadAdminPanel() {
  // Carrega a lista de serviços na tabela
  loadAdminPanelServices();

  // Configura o formulário de edição (será chamado quando o modal abrir)
  setupEditServiceModal();
}

async function loadAdminPanelServices() {
  const tableBody = document.getElementById("services-table-body");
  tableBody.innerHTML = '<tr><td colspan="6">Carregando serviços...</td></tr>';

  try {
    const response = await fetch(`${API_URL}/api/servicos`); // Não precisa de token para listar
    const data = await response.json();
    tableBody.innerHTML = ""; // Limpa a tabela

    if (data.success) {
      if (data.data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Nenhum serviço cadastrado.</td></tr>';
        return;
      }
      data.data.forEach((servico) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
                    <td>${servico.nome}</td>
                    <td>R$ ${servico.preco.toFixed(2)}</td>
                    <td>${servico.duracao} min</td>
                    <td>${servico.tipo}</td>
                    <td>${servico.disponivel ? "Sim" : "Não"}</td>
                    <td class="actions-cell">
                        <button class="btn btn-edit" data-id="${servico._id}">Editar</button>
                        <button class="btn btn-delete" data-id="${servico._id}">Excluir</button>
                    </td>
                `;
      });

      // Adiciona eventos aos botões da tabela
      setupAdminTableActions();
    } else {
      tableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar serviços.</td></tr>';
    }
  } catch (error) {
    console.error("Erro ao carregar serviços para admin:", error);
    tableBody.innerHTML = '<tr><td colspan="6">Erro de comunicação.</td></tr>';
  }
}

function setupAdminTableActions() {
  const tableBody = document.getElementById("services-table-body");

  tableBody.addEventListener("click", async (e) => {
    const target = e.target;
    const serviceId = target.getAttribute("data-id");

    if (!serviceId) return;

    // Botão Excluir
    if (target.classList.contains("btn-delete")) {
      if (confirm(`Tem certeza que deseja excluir o serviço com ID ${serviceId}?`)) {
        try {
          const response = await fetch(`${API_URL}/api/servicos/${serviceId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.success) {
            showAlert("Sucesso", "Serviço excluído com sucesso!");
            loadAdminPanelServices(); // Recarrega a tabela
          } else {
            showAlert("Erro", data.error || "Erro ao excluir serviço.");
          }
        } catch (error) {
          console.error("Erro ao excluir serviço:", error);
          showAlert("Erro", "Erro de comunicação ao excluir.");
        }
      }
    }

    // Botão Editar
    if (target.classList.contains("btn-edit")) {
      openEditServiceModal(serviceId);
    }
  });
}

async function openEditServiceModal(serviceId) {
  // Busca os dados do serviço específico
  try {
    const response = await fetch(`${API_URL}/api/servicos/${serviceId}`);
    const data = await response.json();

    if (data.success) {
      const servico = data.data;
      // Preenche o formulário do modal
      document.getElementById("edit-service-id").value = servico._id;
      document.getElementById("edit-nome").value = servico.nome;
      document.getElementById("edit-descricao").value = servico.descricao;
      document.getElementById("edit-preco").value = servico.preco;
      document.getElementById("edit-duracao").value = servico.duracao;
      document.getElementById("edit-tipo").value = servico.tipo;
      document.getElementById("edit-disponivel").checked = servico.disponivel;

      // Abre o modal
      editServiceModal.style.display = "block";
    } else {
      showAlert("Erro", "Não foi possível carregar os dados do serviço para edição.");
    }
  } catch (error) {
    console.error("Erro ao buscar serviço para edição:", error);
    showAlert("Erro", "Erro de comunicação ao buscar serviço.");
  }
}

function setupEditServiceModal() {
  const editForm = document.getElementById("edit-service-form");
  if (!editForm) return;

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const serviceId = document.getElementById("edit-service-id").value;

    const updatedData = {
      nome: document.getElementById("edit-nome").value,
      descricao: document.getElementById("edit-descricao").value,
      preco: parseFloat(document.getElementById("edit-preco").value),
      duracao: parseInt(document.getElementById("edit-duracao").value),
      tipo: document.getElementById("edit-tipo").value,
      disponivel: document.getElementById("edit-disponivel").checked,
    };

    try {
      const response = await fetch(`${API_URL}/api/servicos/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      if (data.success) {
        editServiceModal.style.display = "none"; // Fecha o modal
        showAlert("Sucesso", "Serviço atualizado com sucesso!");
        loadAdminPanelServices(); // Recarrega a tabela
      } else {
        showAlert("Erro", data.error || "Erro ao atualizar serviço.");
      }
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      showAlert("Erro", "Erro de comunicação ao atualizar.");
    }
  });
}

// Adicionar o HTML do Modal de Edição ao final do body ou dentro do container principal
// (Precisa ser adicionado ao index.html também)
function addEditModalHtml() {
    const modalHtml = `
    <div id="edit-service-modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Editar Serviço</h2>
            <form id="edit-service-form" class="admin-form">
                <input type="hidden" id="edit-service-id">
                <div class="form-group">
                    <label for="edit-nome">Nome:</label>
                    <input type="text" id="edit-nome" required>
                </div>
                <div class="form-group">
                    <label for="edit-descricao">Descrição:</label>
                    <textarea id="edit-descricao" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="edit-preco">Preço (R$):</label>
                    <input type="number" id="edit-preco" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="edit-duracao">Duração (minutos):</label>
                    <input type="number" id="edit-duracao" required>
                </div>
                <div class="form-group">
                    <label for="edit-tipo">Tipo:</label>
                    <select id="edit-tipo" required>
                        <option value="corte">Corte</option>
                        <option value="barba">Barba</option>
                        <option value="combo">Combo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-disponivel">Disponível:</label>
                    <input type="checkbox" id="edit-disponivel">
                </div>
                <button type="submit" class="btn btn-primary">Salvar Alterações</button>
            </form>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    // Re-setup dos modais para incluir o novo
    setupModals();
}

// Chama a função para adicionar o HTML do modal dinamicamente
addEditModalHtml();

