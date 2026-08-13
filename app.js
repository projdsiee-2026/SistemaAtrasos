const config = window.APP_CONFIG || {};
const $ = selector => document.querySelector(selector);
const elements = {
  login: $("#login-screen"), loginForm: $("#login-form"), loginError: $("#login-error"), loginSubmit: $("#login-submit"),
  app: $("#app-content"), user: $("#logged-user"), start: $("#start-camera"), stop: $("#stop-camera"), reader: $("#reader"),
  manualForm: $("#manual-form"), studentInput: $("#student-id"), studentCard: $("#student-card"), recordForm: $("#record-form"),
  save: $("#save-record"), cancel: $("#cancel-record"), message: $("#message"), logout: $("#logout")
};
let sessionToken = sessionStorage.getItem("schoolSession") || "";
let qrScanner = null;
let currentStudent = null;
let scanLocked = false;

$("#school-name").textContent = config.SCHOOL_NAME || "Escola";
configureIdentity();
updateConnectionStatus();
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
window.addEventListener("load", restoreSession);
elements.loginForm.addEventListener("submit", login);
elements.start.addEventListener("click", startCamera);
elements.stop.addEventListener("click", stopCamera);
elements.manualForm.addEventListener("submit", event => { event.preventDefault(); lookupStudent(elements.studentInput.value); });
elements.recordForm.addEventListener("submit", saveRecord);
elements.cancel.addEventListener("click", resetStudent);
elements.logout.addEventListener("click", logout);

async function login(event) {
  event.preventDefault();
  elements.loginSubmit.disabled = true;
  elements.loginSubmit.textContent = "Entrando…";
  elements.loginError.classList.add("hidden");
  try {
    const result = await request("login", { username: $("#login-user").value.trim(), password: $("#login-password").value });
    sessionToken = result.sessionToken;
    sessionStorage.setItem("schoolSession", sessionToken);
    openApp(result.user);
    elements.loginForm.reset();
  } catch (error) { showLoginError(error.message); }
  finally { elements.loginSubmit.disabled = false; elements.loginSubmit.textContent = "Entrar"; }
}

async function restoreSession() {
  if (!sessionToken) return;
  try { const result = await api("verificarSessao"); openApp(result.user); }
  catch (_) { clearSession(); }
}

function openApp(user) {
  elements.user.textContent = `${user.nome} · ${user.perfil}`;
  elements.login.classList.add("hidden");
  elements.app.classList.remove("hidden");
  elements.loginError.classList.add("hidden");
}

async function logout() {
  await stopCamera();
  try { if (sessionToken) await api("logout"); } catch (_) {}
  clearSession();
}

function clearSession() {
  sessionToken = "";
  sessionStorage.removeItem("schoolSession");
  currentStudent = null;
  elements.app.classList.add("hidden");
  elements.login.classList.remove("hidden");
}

function showLoginError(text) { elements.loginError.textContent = text; elements.loginError.classList.remove("hidden"); }
function updateConnectionStatus() { $("#connection-status").classList.toggle("offline", !navigator.onLine); }
function configureIdentity() {
  const logo = $("#school-logo");
  if (config.LOGO_URL) {
    logo.onload = () => {
      logo.classList.remove("hidden");
      document.documentElement.style.setProperty("--school-watermark", `url("${config.LOGO_URL}")`);
    };
    logo.onerror = () => {
      logo.classList.add("hidden");
      document.documentElement.style.setProperty("--school-watermark", "none");
      console.error("Logo não encontrada em:", config.LOGO_URL);
    };
    logo.src = config.LOGO_URL;
    if (logo.complete && logo.naturalWidth > 0) logo.onload();
  }
  $("#footer-year").textContent = config.FOOTER_YEAR ? `© ${config.FOOTER_YEAR}` : "";
  $("#footer-team").textContent = config.FOOTER_TEAM ? `Equipe de desenvolvimento: ${config.FOOTER_TEAM}` : "";
  $("#footer-teacher").textContent = config.FOOTER_TEACHER ? `Professora responsável: ${config.FOOTER_TEACHER}` : "";
  $("#footer-coordination").textContent = config.FOOTER_COORDINATION ? `Coordenação: ${config.FOOTER_COORDINATION}` : "";
}

async function request(action, payload = {}) {
  if (!config.API_URL || config.API_URL.includes("COLE_AQUI")) throw new Error("Configure a URL do Apps Script em config.js.");
  const response = await fetch(config.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action, ...payload }) });
  if (!response.ok) throw new Error("Não foi possível acessar o sistema.");
  const result = await response.json();
  if (!result.ok) throw Object.assign(new Error(result.message || "A operação não pôde ser concluída."), { authError: result.authError });
  return result;
}

async function api(action, payload = {}) {
  if (!sessionToken) throw new Error("Faça login para continuar.");
  try { return await request(action, { sessionToken, ...payload }); }
  catch (error) { if (error.authError) clearSession(); throw error; }
}

async function startCamera() {
  if (!window.Html5Qrcode) return showMessage("O leitor não carregou. Verifique a internet.", "error");
  try {
    qrScanner = new Html5Qrcode("reader"); elements.reader.classList.remove("hidden"); elements.start.classList.add("hidden"); elements.stop.classList.remove("hidden");
    await qrScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * .72, height: Math.min(w, h) * .72 }) }, decoded => { if (!scanLocked) lookupStudent(decoded); }, () => {});
  } catch (_) { await stopCamera(); showMessage("Não foi possível abrir a câmera. Autorize o acesso e use HTTPS.", "error"); }
}
async function stopCamera() {
  if (qrScanner) { try { if (qrScanner.isScanning) await qrScanner.stop(); } catch (_) {} try { qrScanner.clear(); } catch (_) {} qrScanner = null; }
  elements.reader.classList.add("hidden"); elements.start.classList.remove("hidden"); elements.stop.classList.add("hidden");
}
async function lookupStudent(rawId) {
  const qrContent = String(rawId || "").trim();
  const prefix = "IEE:ALUNO:";

  const studentId = qrContent.toUpperCase().startsWith(prefix)
    ? qrContent.slice(prefix.length).trim()
    : qrContent;

  if (!studentId || scanLocked) return;

  scanLocked = true;
  showMessage("Consultando aluno…");

  try {
    const result = await api("consultarAluno", { studentId });

    currentStudent = result.student;
    fillStudent(currentStudent);

    await stopCamera();
    showMessage("Aluno encontrado.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setTimeout(() => {
      scanLocked = false;
    }, config.SCAN_PAUSE_MS || 2500);
  }
}
function fillStudent(student) {
  $("#student-name").textContent = student.nome; $("#student-registration").textContent = student.id; $("#student-class").textContent = student.turma;
  $("#student-shift").textContent = student.turno; $("#student-educator").textContent = student.pedagoga;
  elements.studentCard.classList.remove("hidden"); elements.studentCard.scrollIntoView({ behavior: "smooth", block: "start" });
}
async function saveRecord(event) {
  event.preventDefault(); if (!currentStudent) return; elements.save.disabled = true; elements.save.textContent = "Registrando…";
  try { const result = await api("registrarAtraso", { studentId: currentStudent.id, tipo: $("#record-type").value, observacao: $("#notes").value.trim() }); showMessage(result.message, "success"); resetStudent(); }
  catch (error) { showMessage(error.message, error.message.toLowerCase().includes("duplicado") ? "warning" : "error"); }
  finally { elements.save.disabled = false; elements.save.textContent = "Registrar atraso"; }
}
function resetStudent() { currentStudent = null; elements.studentCard.classList.add("hidden"); elements.recordForm.reset(); elements.manualForm.reset(); }
function showMessage(text, type = "") { elements.message.textContent = text; elements.message.className = `message ${type}`.trim(); clearTimeout(showMessage.timer); if (type === "success") showMessage.timer = setTimeout(() => elements.message.classList.add("hidden"), 4500); }
