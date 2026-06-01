# Cahier des Charges - Luxe Beauty
## Application E-commerce Cosmétique

**Version:** 1.0  
**Date:** Avril 2024  
**Purpose:** Application d'apprentissage Cypress - Tests E2E

---

## 1. Presentation du Projet

### 1.1 Description
Luxe Beauty est une application e-commerce de vente de produits cosmétiques avec:
- **Backend:** Node.js + Express.js
- **Frontend:** HTML5/CSS3/Vanilla JavaScript
- **Base de données:** MySQL (optionnel - mémoire sinon)
- **Testing:** Cypress

### 1.2 Objectifs Pedagogiques
- Apprendre les tests E2E avec Cypress
- Tester les fonctionnalités e-commerce classiques
- Maîtriser les selectors data-cy
- Tests d'authentification, panier, checkout, commentaires

---

## 2. Specification Fonctionnelle

### 2.1 Module Produits

| Fonctionnalite | Description |
|--------------|-------------|
| Liste produits | Affichage grid avec images, prix, catégories |
| Filtrage | Filtres: All, Skincare, Makeup, Lips, Eyes |
| Details produit | Modal avec description complète |
| Ajout panier | Bouton "Add to Bag" |

#### Produits Disponibles
1. Luxury Face Cream - Skincare - $45.99
2. Vitamin C Serum - Skincare - $39.99
3. Hydrating Lipstick - Lips - $24.99
4. Volumizing Mascara - Eyes - $18.99
5. Foundation SPF 30 - Face - $35.99
6. Rose Gold Palette - Eyes - $52.99

### 2.2 Module Panier

| Fonctionnalite | Description |
|--------------|-------------|
| View cart | Liste des articles ajoutés |
| Quantity +/- | Modifier quantité |
| Remove | Supprimer article |
| Total | Calcul automatique |
| Checkout | Passage à la commande |

### 2.3 Module Commande

| Fonctionnalite | Description |
|--------------|-------------|
| Formulaire | Nom, email, phone, address |
| Validation | Champs obligatoires |
| Confirmation | Numéro de commande |
| Clear cart | Vidage après commande |

### 2.4 Module Utilisateur

| Fonctionnalite | Description |
|--------------|-------------|
| Inscription | Username, email, password, fullName |
| Connexion | Login avec identifiants |
| Deconnexion | Logout |
| Profil | Affichage infos utilisateur |

### 2.5 Module Commentaires

| Fonctionnalite | Description |
|--------------|-------------|
| View reviews | Liste des avis par produit |
| Write review | Note (1-5) + commentaire |
| Auth required | Login obligatoire |

### 2.6 Module Mot de Passe

| Fonctionnalite | Description |
|--------------|-------------|
| Forgot password | Demande reset par email |
| Reset link | Token affiché en console (dev) |
| New password | Formulaire nouveau mot de passe |

---

## 3. Structure des Donnees

### 3.1 Produits (products)
```json
{
  "id": "number",
  "name": "string",
  "category": "string",
  "price": "number",
  "image": "string URL",
  "description": "string",
  "details": "string (multiline)"
}
```

### 3.2 Utilisateurs (users)
```json
{
  "id": "number",
  "username": "string UNIQUE",
  "email": "string UNIQUE",
  "password": "string",
  "fullName": "string",
  "role": "string",
  "resetToken": "string",
  "resetTokenExpiry": "datetime",
  "createdAt": "datetime"
}
```

### 3.3 Commentaires (comments)
```json
{
  "id": "number",
  "productId": "number",
  "userId": "number",
  "username": "string",
  "rating": "number (1-5)",
  "comment": "string",
  "createdAt": "datetime"
}
```

### 3.4 Commandes (orders)
```json
{
  "id": "number",
  "userId": "number",
  "customerName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "customerAddress": "string",
  "items": "JSON string",
  "total": "number",
  "status": "string",
  "createdAt": "datetime"
}
```

---

## 4. API Endpoints

### 4.1 Produits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Liste produits |
| GET | `/api/products?category=X` | Filtre catégorie |
| GET | `/api/products/:id` | Détail produit |

### 4.2 Panier
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add item |
| PUT | `/api/cart/:id` | Update quantity |
| DELETE | `/api/cart/:id` | Remove item |
| DELETE | `/api/cart` | Clear cart |

### 4.3 Commentaires
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/:productId` | Get comments |
| POST | `/api/comments` | Add comment |

### 4.4 Authentification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Forgot password |
| POST | `/api/auth/reset-password` | Reset password |

### 4.5 Commandes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout` | Place order |
| GET | `/api/orders` | Get orders |

---

## 5. Attributs Cypress (data-cy)

### 5.1 Navigation
| Attribute | Element |
|-----------|---------|
| `data-cy="header"` | Header |
| `data-cy="store-title"` | Logo/Titre |
| `data-cy="nav"` | Navigation |
| `data-cy="cart-count"` | Nombre d'articles |
| `data-cy="login-link"` | Link login |
| `data-cy="register-link"` | Link register |
| `data-cy="profile-link"` | Link profile |
| `data-cy="logout-link"` | Link logout |

### 5.2 Produits
| Attribute | Element |
|-----------|---------|
| `data-cy="products-grid"` | Grid produits |
| `data-cy="product-card"` | Carte produit |
| `data-cy="product-image"` | Image |
| `data-cy="product-name"` | Nom |
| `data-cy="product-price"` | Prix |
| `data-cy="view-details-btn"` | Bouton voir détails |
| `data-cy="add-to-cart-btn"` | Bouton ajouter |

### 5.3 Filtres
| Attribute | Element |
|-----------|---------|
| `data-cy="filters"` | Conteneur filtres |
| `data-cy="filter-all"` | Bouton All |
| `data-cy="filter-skincare"` | Bouton Skincare |
| `data-cy="filter-makeup"` | Bouton Makeup |
| `data-cy="filter-lips"` | Bouton Lips |
| `data-cy="filter-eyes"` | Bouton Eyes |

### 5.4 Panier
| Attribute | Element |
|-----------|---------|
| `data-cy="cart-title"` | Titre panier |
| `data-cy="cart-items"` | Liste items |
| `data-cy="cart-item"` | Item |
| `data-cy="cart-item-quantity"` | Quantité |
| `data-cy="increase-btn"` | Bouton + |
| `data-cy="decrease-btn"` | Bouton - |
| `data-cy="remove-btn"` | Bouton supprimer |
| `data-cy="cart-empty"` | Message panier vide |
| `data-cy="cart-summary"` | Résumé |
| `data-cy="total-amount"` | Total |
| `data-cy="checkout-btn"` | Bouton checkout |

### 5.5 Checkout
| Attribute | Element |
|-----------|---------|
| `data-cy="checkout-title"` | Titre checkout |
| `data-cy="checkout-form"` | Formulaire |
| `data-cy="input-name"` | Champ nom |
| `data-cy="input-email"` | Champ email |
| `data-cy="input-phone"` | Champ téléphone |
| `data-cy="input-address"` | Champ adresse |
| `data-cy="checkout-total"` | Total checkout |
| `data-cy="place-order-btn"` | Bouton commander |

### 5.6 Authentification
| Attribute | Element |
|-----------|---------|
| `data-cy="auth-section"` | Section auth |
| `data-cy="auth-title"` | Titre |
| `data-cy="login-form"` | Formulaire login |
| `data-cy="login-title"` | Titre login |
| `data-cy="input-username"` | Username |
| `data-cy="input-password"` | Password |
| `data-cy="login-btn"` | Bouton login |
| `data-cy="register-form"` | Formulaire register |
| `data-cy="register-title"` | Titre register |
| `data-cy="input-reg-username"` | Username |
| `data-cy="input-reg-email"` | Email |
| `data-cy="input-reg-fullname"` | Full name |
| `data-cy="input-reg-password"` | Password |
| `data-cy="register-btn"` | Bouton register |
| `data-cy="switch-to-register"` | Link to register |
| `data-cy="switch-to-login"` | Link to login |
| `data-cy="forgot-title"` | Titre forgot |
| `data-cy="forgot-form"` | Formulaire forgot |
| `data-cy="input-forgot-email"` | Email |
| `data-cy="forgot-btn"` | Bouton send |
| `data-cy="switch-to-forgot"` | Link to forgot |
| `data-cy="switch-to-login-forgot"` | Link back |

### 5.7 Profil
| Attribute | Element |
|-----------|---------|
| `data-cy="profile-section"` | Section profile |
| `data-cy="profile-title"` | Titre profile |
| `data-cy="profile-username"` | Username |
| `data-cy="profile-email"` | Email |
| `data-cy="profile-fullname"` | Full name |
| `data-cy="profile-created"` | Date création |

### 5.8 Modal Produit
| Attribute | Element |
|-----------|---------|
| `data-cy="modal-close"` | Close button |
| `data-cy="product-detail"` | Container |
| `data-cy="detail-image"` | Image |
| `data-cy="detail-category"` | Catégorie |
| `data-cy="detail-name"` | Nom |
| `data-cy="detail-description"` | Description |
| `data-cy="detail-details"` | Détails |
| `data-cy="detail-price"` | Prix |
| `data-cy="detail-add-cart"` | Ajouter |

### 5.9 Commentaires
| Attribute | Element |
|-----------|---------|
| `data-cy="comments-title"` | Titre |
| `data-cy="comments-list"` | Liste |
| `data-cy="comment-item"` | Commentaire |
| `data-cy="no-comments"` | Pas de commentaires |
| `data-cy="add-comment-title"` | Ajouter titre |
| `data-cy="comment-form"` | Formulaire |
| `data-cy="input-rating"` | Note |
| `data-cy="input-comment"` | Texte |
| `data-cy="submit-comment-btn"` | Soumettre |
| `data-cy="login-to-comment"` | Login requis |
| `data-cy="login-to-comment-link"` | Link login |

### 5.10 Success
| Attribute | Element |
|-----------|---------|
| `data-cy="success-section"` | Section |
| `data-cy="success-message"` | Message |
| `data-cy="order-number"` | Numéro |
| `data-cy="continue-shopping-btn"` | Continuer |

---

## 6. Installation

### 6.1 Prerequisites
- Node.js
- MySQL (optionnel)

### 6.2 Setup
```bash
# Install dependencies
npm install

# Setup MySQL (optionnel)
mysql -u root -p < database.sql

# Start server
npm start

# Open application
http://localhost:3000
```

### 6.3 Cypress
```bash
# Install Cypress
npm install -D cypress

# Open Cypress
npx cypress open
```

---

## 7. Cas de Test

### 7.1 Test Produits
- [ ] TC001: Afficher tous les produits
- [ ] TC002: Filt7rer par Skincare
- [ ] TC003: Filtrer par Makeup
- [ ] TC004: Ouvrir détails produit
- [ ] TC005: Ajouter produit au panier

### 7.2 Test Panier
- [ ] TC010: View cart vide
- [ ] TC011: Ajouter produit au cart
- [ ] TC012: Augmenter quantité
- [ ] TC013: Diminuer quantité
- [ ] TC014: Supprimer article
- [ ] TC015: Total correct
- [ ] TC016: Checkout

### 7.3 Test Commentaires
- [ ] TC020: Voir commentaires
- [ ] TC021: Login requis pour commenter
- [ ] TC022: Ajouter commentaire
- [ ] TC023: Afficher nouveau commentaire

### 7.4 Test Authentification
- [ ] TC030: Inscription avec succès
- [ ] TC031: Inscription email existant
- [ ] TC032: Inscription username existant
- [ ] TC040: Login avec succès
- [ ] TC041: Login mauvais identifiants
- [ ] TC042: Logout
- [ ] TC050: Forgot password

### 7.5 Test Checkout
- [ ] TC060: Valider formulaire vide
- [ ] TC061: Valider email invalide
- [ ] TC062: Soumettre commande
- [ ] TC063: Confirmation commande
- [ ] TC064: Panier vidé

---

## 8. Technologies

| Technology | Version |
|------------|---------|
| Node.js | Latest |
| Express.js | ^4.18.2 |
| MySQL | Latest |
| nodemailer | ^6.9.0 |
| express-session | ^1.17.3 |
| body-parser | ^1.20.2 |
| cors | ^2.8.5 |
| mysql2 | ^3.6.0 |

---

## 9. Structure des Fichiers

```
cosmetic-store/
├── package.json          # Dependencies
├── server.js           # Backend Express.js
├── database.sql        # MySQL schema
├── CAHIER-CHARGES.md   # This document
└── public/
    ├── index.html     # HTML frontend
    ├── styles.css    # Styles
    └── app.js        # JavaScript frontend
```

---

## 10. Auteurs

Application créée pour l'apprentissage de Cypress.

---

## 11. Annexe: Commandes Utiles

```bash
# Backup base de données
mysqldump -u root -p cosmetic_db > backup.sql

# Test API
curl http://localhost:3000/api/products

# Logs
# Les tokens de reset password sont affichés en console
```