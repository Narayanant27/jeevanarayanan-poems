async function initPoets() {
  const poets = await fetchJSON("data/poets.json");
  const list = document.getElementById("poetList");
  poets.forEach(p => {
    const card = document.createElement("div");
    card.className = "poet-card";
    card.innerHTML = `
      <img src="${p.photo || 'images/placeholder.jpg'}" alt="${p.name}" width="100">
      <div>
        <h3>${p.name}</h3>
        <p>${p.bio || ''}</p>
        <small>Joined: ${p.created_at}</small>
      </div>`;
    list.appendChild(card);
  });
}

initPoets();
