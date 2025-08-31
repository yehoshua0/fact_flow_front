# FactFlow Frontend

Frontend (extension Chrome) pour la détection de fake news avec FactFlow.

## Fonctionnalités

- Analyse de la crédibilité d’un article ou d’un texte sur la page web visitée
- Affichage du score, du label et d’une explication
- Système de vote utilisateur sur la crédibilité
- Popup d’extension ergonomique

## Installation

1. Cloner ce dépôt ou copier le dossier `fact_flow_front`
2. Ouvrir Chrome et accéder à `chrome://extensions/`
3. Activer le **mode développeur**
4. Cliquer sur **Charger l’extension non empaquetée**
5. Sélectionner le dossier `fact_flow_front`

## Structure

- `manifest.json` : Déclaration de l’extension Chrome
- `background.js` : Script d’arrière-plan (gestion des requêtes, communication)
- `content.js` : Script injecté dans les pages (récupération du texte, affichage)
- `popup.html`, `popup.js`, `popup.css` : Interface utilisateur de la popup
- `assets/` : Icônes et images

## Utilisation

1. Cliquer sur l’icône FactFlow dans la barre d’extensions
2. Lire l’analyse de la page courante
3. Voter sur la crédibilité si souhaité

## Communication avec le backend

- Envoie le texte de la page à l’API `/analyze`
- Affiche le score, le label et l’explication retournés
- Permet de voter via l’API `/vote`

## Développement

- Modifier les fichiers JS/HTML/CSS selon les besoins
- Recharger l’extension dans Chrome après chaque modification

## Jour 1 ✅

- [x] Squelette extension Chrome (Manifest V3, scripts de base)
- [x] Popup HTML/CSS fonctionnelle avec logo et message “FactFlow actif”
- [x] Bouton test affichant “Extension Ready!”
- [x] Injection d’un badge test ou surlignage sur la page web

## Jour 2 ✅

- [x] Connexion à l’API `/analyze` du backend
- [x] Envoi du texte sélectionné ou de l’URL à l’API
- [x] Affichage du score dans la popup (🟢🟡🔴)
- [x] Badge coloré sur les articles détectés

## Jour 3

- [ ] Boutons “Fiable” 👍 et “Douteux” dans la popup
- [ ] Envoi du vote à l’API `/vote` du backend
- [ ] Mise à jour en temps réel du score communauté dans la popup
- [ ] Affichage : score AI, score communauté, score final combiné
- [ ] Boutons interactifs qui modifient la base

## Jour 4

- [ ] Affichage des explications détaillées renvoyées par `/analyze`
- [ ] Ajout d’un onglet “Mon Profil” dans la popup (points + réputation)
- [ ] UI améliorée : icônes et couleurs cohérentes (🟢🟡🔴)
- [ ] Onglet profil avec compteur de points
- [ ] Meilleure ergonomie (couleurs + design simple)

## Jour 5

- [ ] Tests complets avec backend en conditions réelles
- [ ] Gestion CORS + sécurisation (clé API dans headers)
- [ ] Nettoyage du code et préparation démo finale
- [ ] Extension prête pour Chrome/Firefox
- [ ] Démo complète (analyse, score, explication, votes en direct)
- [ ] Documentation rapide (README + capture écran)

---

© 2025
