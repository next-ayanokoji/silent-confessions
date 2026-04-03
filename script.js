// ======================
// JSONBin Setup
// ======================
const BIN_ID = ""; // Get from https://jsonbin.io/dashboard
const SECRET_KEY = ""; // Get from https://jsonbin.io/dashboard
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`; //ADD YOUR OWN BIN ID

// ======================
// Show Page Function
// ======================
function showPage(page){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(page).classList.add("active");
}

// ======================
// DOM Ready
// ======================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav button").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.getAttribute("data-page")));
  });

  document.getElementById("btnSubmit").addEventListener("click", async () => {
    const msg = document.getElementById("confessionText").value.trim();
    if(!msg) return;

    try {
      const res = await fetch(BASE_URL + "/latest", { headers: { "X-Master-Key": SECRET_KEY } });
      const data = await res.json();
      const confessions = data.record.confessions || [];
      confessions.push({ message: msg, timestamp: new Date().toISOString() });

      await fetch(BASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": SECRET_KEY },
        body: JSON.stringify({ confessions })
      });

      document.getElementById("successMsg").textContent = "Confession submitted! 😈";
      document.getElementById("confessionText").value = "";
      loadHallOfConfessions();
      setTimeout(()=> document.getElementById("successMsg").textContent="", 3000);
    } catch(err) { console.error(err); alert("Error submitting confession!"); }
  });

  document.getElementById("btnAdminLogin").addEventListener("click", () => {
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;
    if(user === "admin" && pass === "admin1234"){
      document.getElementById("panel").style.display = "block";
      loadAdminConfessions();
    } else alert("Wrong ID or Password");
  });

  loadHallOfConfessions();
});

// ======================
// Load last 5 confessions (Home)
async function loadHallOfConfessions(){
  try {
    const res = await fetch(BASE_URL + "/latest", { headers: { "X-Master-Key": SECRET_KEY } });
    const data = await res.json();
    const hall = document.getElementById("hallOfConfessions");
    hall.innerHTML = "";

    const latest = (data.record.confessions || []).slice(-5).reverse();
    if(latest.length === 0){
      const placeholders = [
        "Abhi tak koi secret nahi mila… 😏",
        "Lunch break me shayad sab busy hain 🍕",
        "Koi crush ka confession nahi… 😈",
        "Secrets jaldi aayenge… 🤫",
        "School ke hall me abhi bhi silence 🏫"
      ];
      placeholders.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerText = p;
        hall.appendChild(div);
      });
    } else {
      latest.forEach(c => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerText = c.message;
        hall.appendChild(div);
      });
    }
  } catch(err){ console.error(err); }
}

// ======================
// Load Admin Confessions + Delete
async function loadAdminConfessions(){
  try {
    const res = await fetch(BASE_URL + "/latest", { headers: { "X-Master-Key": SECRET_KEY } });
    const data = await res.json();
    const container = document.getElementById("confessionList");
    container.innerHTML = "";

    (data.record.confessions || []).slice().reverse().forEach((c, index)=>{
      const div = document.createElement("div");
      div.className = "card";
      div.innerText = c.message;

      const delBtn = document.createElement("button");
      delBtn.innerText = "Delete ❌";
      delBtn.addEventListener("click", async ()=>{
        if(confirm("Are you sure to delete this confession?")){
          await deleteConfession(index);
        }
      });
      div.appendChild(delBtn);
      container.appendChild(div);
    });
  } catch(err){ console.error(err); }
}

// ======================
// Delete Function
async function deleteConfession(idx){
  try {
    const res = await fetch(BASE_URL + "/latest", { headers: { "X-Master-Key": SECRET_KEY } });
    const data = await res.json();
    const confessions = data.record.confessions || [];
    confessions.splice(idx, 1);

    await fetch(BASE_URL, {
      method: "PUT",
      headers: { "Content-Type":"application/json", "X-Master-Key": SECRET_KEY },
      body: JSON.stringify({ confessions })
    });

    loadAdminConfessions();
    loadHallOfConfessions();
  } catch(err){ console.error(err); alert("Error deleting confession"); }
}

// ======================
// Real-time polling every 2 sec
setInterval(() => {
  if(document.getElementById("panel").style.display === "block") loadAdminConfessions();
  loadHallOfConfessions();
}, 2000);