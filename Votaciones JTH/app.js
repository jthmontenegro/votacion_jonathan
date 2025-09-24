const URL_CANDIDATOS = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/refs/heads/main/candidatos.json";
const URL_ADMIN = "https://raw.githubusercontent.com/CesarMCuellarCha/apis/refs/heads/main/administrador.json";

let candidatos = [];
let eleccionesActivas = false;

async function cargarCandidatos() {
  try {
    const res = await fetch(URL_CANDIDATOS);
    const data = await res.json();
    candidatos = Array.isArray(data) ? data : data.candidatos;

    // Programas actualizados
    const programasSena = [
      "Desarrollo Gráfico",
      "Análisis de Software",
      "Inteligencia Artificial"
    ];

    candidatos.forEach(c => {
if (c.nombre.toLowerCase().includes("juan")) {
  c.foto = "../images/icono_persona.png";
} else if (c.nombre.toLowerCase().includes("monik")) {
  c.foto = "../images/icono_persona.png";
} else if (c.nombre.toLowerCase().includes("carlos")) {
  c.foto = "../images/icono_persona.png";
}

if ((c.nombre || "").toLowerCase().includes("blanco")) {
  c.foto = "../images/icono_blanco.png";
  c.programa = "—";
}

      if (!(c.nombre.toLowerCase().includes("blanco"))) {
        const randomIndex = Math.floor(Math.random() * programasSena.length);
        c.programa = programasSena[randomIndex];
      }
    });

    let candidatoBlanco = candidatos.find(c => (c.nombre || "").toLowerCase().includes("blanco"));
    if (candidatoBlanco) {
      candidatoBlanco.foto = "../images/icono_blanco.png";
      candidatoBlanco.programa = "—";
    } else {
      candidatos.push({
        id: "blanco",
        nombre: "Candidato en Blanco",
        programa: "—",
        foto: "./images/icono_blanco.png"
      });
    }

    if (!localStorage.getItem("votos")) {
      const votosIniciales = {};
      candidatos.forEach(c => votosIniciales[c.nombre] = 0);
      localStorage.setItem("votos", JSON.stringify(votosIniciales));
    }

    mostrarCandidatos();
  } catch (err) {
    console.error("Error al cargar candidatos:", err);
    document.getElementById("candidatos").innerHTML = "<p>Error al cargar candidatos.</p>";
  }
}

function mostrarCandidatos() {
  const contenedor = document.getElementById("candidatos");
  contenedor.innerHTML = "";

  candidatos.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${c.nombre}${c.programa !== "—" ? " - " + c.programa : ""}</h3>
      <div class="foto">
        <img src="${c.foto}" alt="${c.nombre}">
      </div>
      <div class="datos">
        <label>Aprendiz:
          <input type="text" placeholder="Nombre">
        </label>
        <label>Ficha:
          <input type="text" placeholder="numero_ficha">
        </label>
      </div>
    `;

    card.querySelector(".foto img").addEventListener("click", () => votar(c));
    contenedor.appendChild(card);
  });
}

function votar(candidato) {
  if (!eleccionesActivas) {
    alert("Las elecciones no están activas.");
    return;
  }

  if (confirm(`¿Está seguro de votar por ${candidato.nombre}?`)) {
    let votos = JSON.parse(localStorage.getItem("votos")) || {};
    votos[candidato.nombre] = (votos[candidato.nombre] || 0) + 1;
    localStorage.setItem("votos", JSON.stringify(votos));
    alert(`Voto registrado para ${candidato.nombre}`);
  }
}

async function validarAdmin(usuario, clave) {
  try {
    const res = await fetch(URL_ADMIN, { cache: "no-store" });
    const data = await res.json();
    return data.username === usuario && data.password === clave;
  } catch (err) {
    console.error("Error validando administrador:", err);
    return false;
  }
}

document.getElementById("formAdmin").addEventListener("submit", async e => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;

  const esAdmin = await validarAdmin(usuario, clave);
  if (esAdmin) {
    document.getElementById("controles").style.display = "block";
    alert("Administrador validado. Puede iniciar o cerrar elecciones.");
  } else {
    alert("Credenciales incorrectas.");
  }
});

document.getElementById("btnIniciar").addEventListener("click", () => {
  eleccionesActivas = true;
  document.getElementById("estadoTexto").textContent = "Elecciones en curso";
  document.getElementById("candidatos").classList.remove("oculto");
  document.getElementById("resultados").classList.add("oculto");
});

document.getElementById("btnCerrar").addEventListener("click", () => {
  eleccionesActivas = false;
  document.getElementById("estadoTexto").textContent = "Elecciones cerradas";
  mostrarResultados();
});

function mostrarResultados() {
  const votos = JSON.parse(localStorage.getItem("votos")) || {};
  const contenedor = document.getElementById("listaResultados");
  let maxVotos = Math.max(...Object.values(votos));

  contenedor.innerHTML = `
    <table class="tabla-resultados">
      <thead>
        <tr>
          <th>Candidato</th>
          <th>Votos</th>
        </tr>
      </thead>
      <tbody>
        ${candidatos.map(c => `
          <tr class="${(votos[c.nombre] || 0) === maxVotos ? 'destacado' : ''}">
            <td>${c.nombre}${c.programa !== "—" ? " - " + c.programa : ""}</td>
            <td>${votos[c.nombre] || 0}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.getElementById("candidatos").classList.add("oculto");
  document.getElementById("resultados").classList.remove("oculto");
}

document.addEventListener("DOMContentLoaded", cargarCandidatos);
