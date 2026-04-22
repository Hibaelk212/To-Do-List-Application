let tasks = [];
let utilisateurs = [];
let utilisateurConnecte = null;
let historique = [];
let filtreRecherche = "all";
let texteRecherche = "";

function sauvegarderTout() {
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    if (utilisateurConnecte != null) {
        localStorage.setItem('taches_' + utilisateurConnecte.id, JSON.stringify(tasks));
        localStorage.setItem('historique_' + utilisateurConnecte.id, JSON.stringify(historique));
    }
}

function chargerTachesUtilisateur() {
    if (utilisateurConnecte == null) return;
    let tachesStockees = localStorage.getItem('taches_' + utilisateurConnecte.id);
    if (tachesStockees != null) {
        tasks = JSON.parse(tachesStockees);
    } else {
        tasks = [];
    }
    let histoStockee = localStorage.getItem('historique_' + utilisateurConnecte.id);
    if (histoStockee != null) {
        historique = JSON.parse(histoStockee);
    } else {
        historique = [];
    }
}

function ajouterHistorique(action, details) {
    let date = new Date();
    let dateStr = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
    historique.unshift({ action: action, details: details, date: dateStr });
    if (historique.length > 10) historique.pop();
    sauvegarderTout();
    afficherHistorique();
}

function afficherHistorique() {
    let historyDiv = document.getElementById('historyList');
    if (historyDiv == null) return;
    historyDiv.innerHTML = '';
    if (historique.length == 0) {
        let p = document.createElement('p');
        p.innerHTML = 'Aucune action récente.';
        historyDiv.appendChild(p);
        return;
    }
    for (let i = 0; i < historique.length; i++) {
        let item = document.createElement('div');
        item.className = 'history-item';
        let strong = document.createElement('strong');
        strong.innerHTML = historique[i].action;
        item.appendChild(strong);
        item.appendChild(document.createTextNode(' : ' + historique[i].details));
        let small = document.createElement('small');
        small.innerHTML = '<br>' + historique[i].date;
        item.appendChild(small);
        historyDiv.appendChild(item);
    }
}

function verifierChamps() {
    let nom = document.getElementById('nomTache').value;
    let btnAjouter = document.getElementById('btnAjouter');
    if (nom != "") {
        btnAjouter.className = "btn-ajouter-actif";
    } else {
        btnAjouter.className = "btn-ajouter";
    }
}

function updateStats() {
    let total = tasks.length;
    let terminees = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].done == true) {
            terminees = terminees + 1;
        }
    }
    let restantes = total - terminees;
    document.getElementById('totalTaches').innerHTML = total;
    document.getElementById('tachesTerminees').innerHTML = terminees;
    document.getElementById('tachesRestantes').innerHTML = restantes;
}

function displayTasks() {
    let liste = document.getElementById('listeTaches');
    liste.innerHTML = '';
    
    let tachesFiltrees = [];
    for (let i = 0; i < tasks.length; i++) {
        let correspond = true;
        if (filtreRecherche == "done" && tasks[i].done != true) correspond = false;
        if (filtreRecherche == "pending" && tasks[i].done != false) correspond = false;
        if (texteRecherche != "") {
            if (tasks[i].name.toLowerCase().indexOf(texteRecherche.toLowerCase()) == -1) {
                if (tasks[i].description && tasks[i].description.toLowerCase().indexOf(texteRecherche.toLowerCase()) == -1) {
                    correspond = false;
                }
            }
        }
        if (correspond) {
            tachesFiltrees.push(tasks[i]);
        }
    }
    
    if (tachesFiltrees.length == 0) {
        let p = document.createElement('p');
        p.innerHTML = 'Aucune tâche.';
        liste.appendChild(p);
        updateStats();
        return;
    }
    
    let tasksUrgentes = [];
    let tasksNormales = [];
    for (let i = 0; i < tachesFiltrees.length; i++) {
        let isUrgent = false;
        if (tachesFiltrees[i].name.indexOf("Urgent") != -1 || tachesFiltrees[i].priorite == "Urgent") {
            isUrgent = true;
        }
        if (isUrgent) {
            tasksUrgentes.push(tachesFiltrees[i]);
        } else {
            tasksNormales.push(tachesFiltrees[i]);
        }
    }
    
    let tasksTriees = [];
    for (let i = 0; i < tasksUrgentes.length; i++) {
        tasksTriees.push(tasksUrgentes[i]);
    }
    for (let i = 0; i < tasksNormales.length; i++) {
        tasksTriees.push(tasksNormales[i]);
    }
    
    for (let i = 0; i < tasksTriees.length; i++) {
        let isUrgent = false;
        if (tasksTriees[i].name.indexOf("Urgent") != -1 || tasksTriees[i].priorite == "Urgent") {
            isUrgent = true;
        }
        
        let taskClass = "task ";
        if (tasksTriees[i].done) {
            taskClass = taskClass + "task-done";
        } else {
            taskClass = taskClass + "task-pending";
        }
        if (isUrgent) {
            taskClass = taskClass + " urgent";
        }
        
        let taskDiv = document.createElement('div');
        taskDiv.className = taskClass;
        
        let numero = document.createElement('p');
        numero.innerHTML = "<b>Tâche " + (i+1) + "</b>";
        taskDiv.appendChild(numero);
        
        let nom = document.createElement('p');
        nom.innerHTML = "Titre : " + tasksTriees[i].name;
        taskDiv.appendChild(nom);
        
        if (tasksTriees[i].description && tasksTriees[i].description != "") {
            let desc = document.createElement('p');
            desc.innerHTML = "Description : " + tasksTriees[i].description;
            desc.className = "description-text";
            taskDiv.appendChild(desc);
        }
        
        if (tasksTriees[i].priorite && tasksTriees[i].priorite != "") {
            let priorite = document.createElement('p');
            priorite.innerHTML = "Priorité : " + tasksTriees[i].priorite;
            taskDiv.appendChild(priorite);
        }
        
        let statut = document.createElement('p');
        if (tasksTriees[i].done) {
            statut.innerHTML = "Statut : Terminée";
        } else {
            statut.innerHTML = "Statut : Non terminée";
        }
        taskDiv.appendChild(statut);
        
        if (tasksTriees[i].date) {
            let date = document.createElement('p');
            date.innerHTML = "Date : " + tasksTriees[i].date;
            date.className = "date-text";
            taskDiv.appendChild(date);
        }
        
        if (isUrgent) {
            let messageUrgent = document.createElement('p');
            messageUrgent.className = "urgent-message";
            messageUrgent.innerHTML = "⚠️ Tâche urgente !";
            taskDiv.appendChild(messageUrgent);
        }
        
        let indexReel = -1;
        for (let j = 0; j < tasks.length; j++) {
            if (tasks[j] === tasksTriees[i]) {
                indexReel = j;
                break;
            }
        }
        
        let btnStatut = document.createElement('button');
        btnStatut.className = "btn-statut";
        btnStatut.innerHTML = "Changer statut";
        btnStatut.onclick = function() {
            changerStatut(indexReel);
        };
        taskDiv.appendChild(btnStatut);
        
        let btnModifier = document.createElement('button');
        btnModifier.className = "btn-modifier";
        btnModifier.innerHTML = "Modifier";
        btnModifier.onclick = function() {
            modifierTache(indexReel);
        };
        taskDiv.appendChild(btnModifier);
        
        let btnSupprimer = document.createElement('button');
        btnSupprimer.className = "btn-supprimer";
        btnSupprimer.innerHTML = "Supprimer";
        btnSupprimer.onclick = function() {
            supprimerTache(indexReel);
        };
        taskDiv.appendChild(btnSupprimer);
        
        liste.appendChild(taskDiv);
    }
    updateStats();
}

function ajouterTache() {
    let nom = document.getElementById('nomTache').value;
    let priorite = document.getElementById('priorite').value;
    let description = document.getElementById('descTache').value;
    
    if (nom == "") {
        alert("Veuillez saisir une tâche");
        return;
    }
    
    let date = new Date();
    let dateStr = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
    
    let task = {
        name: nom,
        done: false,
        priorite: priorite,
        description: description,
        date: dateStr
    };
    
    tasks.push(task);
    sauvegarderTout();
    ajouterHistorique("Ajout", "Tâche : " + nom);
    
    document.getElementById('nomTache').value = "";
    document.getElementById('priorite').value = "";
    document.getElementById('descTache').value = "";
    document.getElementById('nomTache').focus();
    
    let btnAjouter = document.getElementById('btnAjouter');
    btnAjouter.className = "btn-ajouter";
    
    displayTasks();
}

function supprimerTache(index) {
    let confirmation = confirm("Supprimer cette tâche ?");
    if (confirmation) {
        let nomTask = tasks[index].name;
        tasks.splice(index, 1);
        sauvegarderTout();
        ajouterHistorique("Suppression", "Tâche : " + nomTask);
        displayTasks();
    }
}

function modifierTache(index) {
    let newName = prompt("Nouveau titre:", tasks[index].name);
    if (newName != null && newName != "") {
        tasks[index].name = newName;
    }
    
    let newDesc = prompt("Nouvelle description:", tasks[index].description || "");
    if (newDesc != null) {
        tasks[index].description = newDesc;
    }
    
    let newPriorite = prompt("Nouvelle priorité:", tasks[index].priorite || "");
    if (newPriorite != null) {
        tasks[index].priorite = newPriorite;
    }
    
    sauvegarderTout();
    ajouterHistorique("Modification", "Tâche modifiée");
    displayTasks();
}

function changerStatut(index) {
    if (tasks[index].done == true) {
        tasks[index].done = false;
        ajouterHistorique("Statut", "Tâche marquée comme non terminée : " + tasks[index].name);
    } else {
        tasks[index].done = true;
        ajouterHistorique("Statut", "Tâche terminée : " + tasks[index].name);
    }
    sauvegarderTout();
    displayTasks();
}

function effacerTout() {
    let confirmation = confirm("Effacer toutes vos tâches ?");
    if (confirmation) {
        tasks = [];
        sauvegarderTout();
        ajouterHistorique("Effacement", "Toutes les tâches ont été supprimées");
        displayTasks();
    }
}

function inscrire() {
    let nom = document.getElementById('regNom').value;
    let email = document.getElementById('regEmail').value;
    let password = document.getElementById('regPassword').value;
    let msg = document.getElementById('authMessage');
    
    if (nom == "" || email == "" || password == "") {
        msg.innerHTML = "Veuillez remplir tous les champs.";
        return;
    }
    
    let emailExiste = false;
    for (let i = 0; i < utilisateurs.length; i++) {
        if (utilisateurs[i].email == email) {
            emailExiste = true;
            break;
        }
    }
    
    if (emailExiste) {
        msg.innerHTML = "Cet email est déjà utilisé.";
        return;
    }
    
    let newUser = {
        id: Date.now(),
        nom: nom,
        email: email,
        password: password
    };
    utilisateurs.push(newUser);
    localStorage.setItem('utilisateurs', JSON.stringify(utilisateurs));
    msg.innerHTML = "Inscription réussie ! Connectez-vous.";
    msg.style.color = "green";
    document.getElementById('regNom').value = "";
    document.getElementById('regEmail').value = "";
    document.getElementById('regPassword').value = "";
    setTimeout(function() {
        msg.innerHTML = "";
        msg.style.color = "red";
    }, 3000);
}

function connecter() {
    let email = document.getElementById('regEmail').value;
    let password = document.getElementById('regPassword').value;
    let msg = document.getElementById('authMessage');
    
    let user = null;
    for (let i = 0; i < utilisateurs.length; i++) {
        if (utilisateurs[i].email == email && utilisateurs[i].password == password) {
            user = utilisateurs[i];
            break;
        }
    }
    
    if (user == null) {
        msg.innerHTML = "Email ou mot de passe incorrect.";
        return;
    }
    
    utilisateurConnecte = user;
    localStorage.setItem('utilisateurConnecte', JSON.stringify(utilisateurConnecte));
    chargerTachesUtilisateur();
    
    document.getElementById('authSection').className = 'hidden';
    document.getElementById('todoSection').className = '';
    document.getElementById('welcomeMessage').innerHTML = "Bonjour " + user.nom + " !";
    
    displayTasks();
    afficherHistorique();
    msg.innerHTML = "";
}

function deconnecter() {
    utilisateurConnecte = null;
    localStorage.removeItem('utilisateurConnecte');
    tasks = [];
    document.getElementById('authSection').className = 'auth-container';
    document.getElementById('todoSection').className = 'hidden';
    document.getElementById('regEmail').value = "";
    document.getElementById('regPassword').value = "";
    document.getElementById('regNom').value = "";
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    let btn = document.getElementById('btnDarkMode');
    if (document.body.classList.contains('dark-mode')) {
        btn.innerHTML = "Mode clair";
        localStorage.setItem('darkMode', 'true');
    } else {
        btn.innerHTML = "Mode sombre";
        localStorage.setItem('darkMode', 'false');
    }
}

function chargerModeSombre() {
    let dark = localStorage.getItem('darkMode');
    if (dark == 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('btnDarkMode').innerHTML = "Mode clair";
    }
}

let usersStockes = localStorage.getItem('utilisateurs');
if (usersStockes != null) {
    utilisateurs = JSON.parse(usersStockes);
}

let userConnecteStocke = localStorage.getItem('utilisateurConnecte');
if (userConnecteStocke != null) {
    utilisateurConnecte = JSON.parse(userConnecteStocke);
    chargerTachesUtilisateur();
    document.getElementById('authSection').className = 'hidden';
    document.getElementById('todoSection').className = '';
    document.getElementById('welcomeMessage').innerHTML = "Bonjour " + utilisateurConnecte.nom + " !";
    displayTasks();
    afficherHistorique();
}

chargerModeSombre();

document.getElementById('btnInscription').onclick = inscrire;
document.getElementById('btnConnexion').onclick = connecter;
document.getElementById('btnDeconnexion').onclick = deconnecter;
document.getElementById('btnAjouter').onclick = ajouterTache;
document.getElementById('btnEffacer').onclick = effacerTout;
document.getElementById('nomTache').oninput = verifierChamps;
document.getElementById('btnDarkMode').onclick = toggleDarkMode;

let searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.onkeyup = function() {
        texteRecherche = searchInput.value;
        displayTasks();
    };
}

document.getElementById('btnFilterAll').onclick = function() {
    filtreRecherche = "all";
    displayTasks();
};
document.getElementById('btnFilterDone').onclick = function() {
    filtreRecherche = "done";
    displayTasks();
};
document.getElementById('btnFilterPending').onclick = function() {
    filtreRecherche = "pending";
    displayTasks();
};

displayTasks();