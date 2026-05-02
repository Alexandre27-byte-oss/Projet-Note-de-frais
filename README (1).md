# 📋 Application Note de Frais — BTS

Application web de gestion de notes de frais en HTML/CSS/JavaScript pur (sans framework).

## 🚀 Fonctionnalités

- **Ajout de dépenses** : date, catégorie, description, montant, numéro de justificatif, notes
- **Catégories** : Transport, Repas, Hébergement, Matériel, Autre
- **Statuts** : En attente / Validé / Refusé
- **Tableau filtrable** : par catégorie, statut, ou recherche textuelle
- **Tri des colonnes** : date, catégorie, montant
- **Vue récapitulative** : répartition graphique par catégorie et statut
- **Statistiques** : total, montant validé, en attente, nombre de frais
- **Export CSV** (importable dans Excel)
- **Export JSON** (sauvegarde des données)
- **Impression / export PDF** (via navigateur)
- **Persistance** : données sauvegardées en localStorage (pas besoin de serveur)
- **Design responsive** : fonctionne sur mobile et desktop

## 📁 Structure du projet

```
note-de-frais/
└── index.html     # Application complète (HTML + CSS + JS dans un seul fichier)
```

## 🛠️ Utilisation

1. Ouvrir `index.html` dans un navigateur (aucune installation requise)
2. Cliquer sur **+ Ajouter** pour créer une dépense
3. Gérer les statuts depuis le détail de chaque dépense
4. Exporter les données via le bouton **Exporter**

## 🚢 Déploiement sur GitHub Pages

```bash
# 1. Créer un repository sur github.com (ex: note-de-frais)
git init
git add .
git commit -m "Initial commit - Application note de frais"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/note-de-frais.git
git push -u origin main

# 2. Activer GitHub Pages
# Settings → Pages → Source : Deploy from a branch → main → / (root)
```

L'app sera accessible sur : `https://TON_USERNAME.github.io/note-de-frais/`

## 🛠️ Technologies

- HTML5
- CSS3 (variables CSS, Grid, Flexbox, animations)
- JavaScript ES6 (localStorage, classes, arrow functions)
- Google Fonts (DM Sans, Syne)

## 📚 Contexte BTS

Projet réalisé dans le cadre d'un BTS pour illustrer :
- La manipulation du DOM en JavaScript
- La persistance des données côté client (localStorage)
- La conception d'une interface utilisateur responsive
- L'export de données (CSV, JSON)
