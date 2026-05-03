# 📋 Registre des Activités de Traitement — GourmetRevient
## Document interne — Conformité RGPD (Art. 30)
**NE PAS PUBLIER — Usage interne uniquement**

---

**Responsable du traitement :** Julian Peresson — GourmetRevient  
**Date de création :** Mai 2026  
**Dernière mise à jour :** Mai 2026

---

## Traitement n°1 — Gestion des comptes utilisateurs

| Champ | Valeur |
|-------|--------|
| **Finalité** | Création et gestion des comptes, authentification |
| **Base légale** | Exécution du contrat (Art. 6.1.b RGPD) |
| **Catégories de personnes** | Clients (artisans pâtissiers, restaurateurs) |
| **Données collectées** | Email, mot de passe hashé, nom, date d'inscription |
| **Durée de conservation** | Durée du compte + 3 ans après clôture |
| **Destinataires** | Supabase Inc. (hébergeur BDD, UE) |
| **Transferts hors UE** | Non |
| **Mesures de sécurité** | Hashage bcrypt, TLS 1.3, RLS PostgreSQL |

---

## Traitement n°2 — Données métier (recettes et fiches techniques)

| Champ | Valeur |
|-------|--------|
| **Finalité** | Fourniture du service principal (calcul coût de revient) |
| **Base légale** | Exécution du contrat (Art. 6.1.b RGPD) |
| **Catégories de personnes** | Clients abonnés |
| **Données collectées** | Recettes, ingrédients, coûts, prix de vente, marges |
| **Durée de conservation** | Durée du compte, suppression sous 30j après clôture |
| **Destinataires** | Supabase Inc. (hébergeur BDD, Stockholm, Suède) |
| **Transferts hors UE** | Non |
| **Mesures de sécurité** | Chiffrement AES-256 au repos, Row Level Security |

---

## Traitement n°3 — Gestion des paiements et abonnements

| Champ | Valeur |
|-------|--------|
| **Finalité** | Facturation, gestion des abonnements Stripe |
| **Base légale** | Exécution du contrat + Obligation légale (Art. 6.1.b et 6.1.c) |
| **Catégories de personnes** | Clients payants |
| **Données collectées** | Email, montant, date, stripe_customer_id, stripe_subscription_id |
| **Note importante** | Les numéros de carte ne transitent JAMAIS par nos serveurs (Stripe gère la tokenisation) |
| **Durée de conservation** | 10 ans (obligation comptable française) |
| **Destinataires** | Stripe Inc. (USA — DPA + CCT en place) |
| **Transferts hors UE** | Oui — USA, encadré par Clauses Contractuelles Types |
| **Mesures de sécurité** | PCI-DSS Niveau 1 (Stripe), HTTPS uniquement |

---

## Traitement n°4 — Logs techniques et sécurité

| Champ | Valeur |
|-------|--------|
| **Finalité** | Sécurité, débogage, détection de tentatives d'intrusion |
| **Base légale** | Intérêt légitime (Art. 6.1.f RGPD) |
| **Données collectées** | Adresse IP, horodatage, type d'action, erreurs |
| **Durée de conservation** | 30 jours glissants |
| **Destinataires** | Supabase Inc., Vercel Inc., GitHub Inc. |
| **Transferts hors UE** | Oui (Vercel, GitHub — USA, CCT en place) |

---

## Traitement n°5 — Statistiques d'usage anonymisées

| Champ | Valeur |
|-------|--------|
| **Finalité** | Amélioration du produit, détection des bugs |
| **Base légale** | Consentement (Art. 6.1.a RGPD) |
| **Données collectées** | Pages visitées, fonctions utilisées (anonymisées, sans IP) |
| **Durée de conservation** | 24 mois |
| **Destinataires** | Usage interne uniquement |
| **Transferts hors UE** | Non |
| **Note** | Traitement désactivé si l'utilisateur refuse les cookies analytiques |

---

## Sous-traitants & DPA

| Prestataire | Pays | Rôle | DPA signé |
|-------------|------|------|-----------|
| Supabase Inc. | USA / Hébergement UE | Base de données | ✅ Acceptation en ligne |
| Stripe Inc. | USA | Paiements | ✅ [stripe.com/legal/dpa](https://stripe.com/fr/legal/dpa) |
| Vercel Inc. | USA | Hébergement front-end | ✅ Acceptation en ligne |
| GitHub Inc. | USA | Dépôt de code + Pages | ✅ Acceptation en ligne |

> **Action requise :** Télécharger et conserver une copie signée du DPA Stripe pour vos archives.

---

## Violations de données (Journal)

*Aucune violation recensée à ce jour.*

En cas de violation : notification à la CNIL sous **72h** (Art. 33 RGPD) et aux utilisateurs concernés si risque élevé (Art. 34 RGPD).

---

## Révisions du registre

| Date | Modification | Auteur |
|------|-------------|--------|
| Mai 2026 | Création initiale | Julian Peresson |

