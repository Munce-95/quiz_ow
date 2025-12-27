// =======================
// CONFIGURATION SUPABASE
// =======================
const SUPABASE_URL = "https://sxwltroedzxkvqpbcqjc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4d2x0cm9lZHp4a3ZxcGJjcWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjQxNzIsImV4cCI6MjA1NjAwMDE3Mn0.F_XIxMSvejY2xLde_LbLcLt564fiW2zF-wqr95rZ2zA";
const API_QUIZ = `${SUPABASE_URL}/rest/v1/quiz_ow`;
const API_JOUEUR = `${SUPABASE_URL}/rest/v1/id_joueur_quiz`;

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};


async function SelectPlayer(){
  const el = document.getElementById('pseudal');
  if (!el) {
    console.error('SelectPlayer: input #pseudal introuvable');
    return null;
  }

  const pseudo = (el.value || '').trim();
  if (!pseudo) {
    alert('Veuillez entrer un pseudo.');
    return null;
  }

  try {
    // 1) Vérifier si le pseudo existe déjà
    const getUrl = API_JOUEUR + `?pseudo=eq.${encodeURIComponent(pseudo)}`;
    const getRes = await fetch(getUrl, { headers: HEADERS });

    if (getRes.ok) {
      const existing = await getRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        // déjà présent → stocker et rediriger
        sessionStorage.setItem('player_pseudo', pseudo);
        sessionStorage.setItem('player_row', JSON.stringify(existing[0]));
        window.location.href = 'quiz_ow_game.html';
        return existing[0];
      }
    }

    // 2) Si absent, insérer
    const postRes = await fetch(API_JOUEUR, {
      method: 'POST',
      headers: Object.assign({}, HEADERS, { Prefer: 'return=representation' }),
      body: JSON.stringify({ 
        id: crypto.randomUUID(),
        pseudo 
      })
    });

    if (!postRes.ok) {
      const txt = await postRes.text().catch(() => '(no body)');
      console.error('Erreur insertion pseudo', postRes.status, txt);
      alert('Impossible de créer le joueur. Voir la console pour les détails.');
      return null;
    }

    const data = await postRes.json().catch(() => null);
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      sessionStorage.setItem('player_pseudo', pseudo);
      sessionStorage.setItem('player_row', JSON.stringify(row));
    }

    window.location.href = 'quiz_ow_game.html';
    return row;
  } catch (err) {
    console.error('SelectPlayer error', err);
    alert('Erreur réseau lors de la création/lecture du joueur.');
    return null;
  }
}