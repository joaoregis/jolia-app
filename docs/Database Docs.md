# Documentação do Banco de Dados (Firestore)

Este documento descreve a estrutura das coleções e documentos do Firebase Firestore para o projeto **Jolia App**.

A aplicação utiliza uma estrutura NoSQL baseada em coleções raiz, onde a maioria dos dados é particionada pelo ID do Perfil (`profileId`).

## Visão Geral das Coleções

| Coleção | Descrição | Particionamento |
| :--- | :--- | :--- |
| `profiles` | Armazena os perfis principais e seus subperfis (subprofiles). | Raiz |
| `transactions` | Contém todas as transações (receitas e despesas). | `profileId` |
| `feedbacks` | Registros de feedback, bugs e débitos técnicos. | `profileId` |
| `media_items` | Itens de entretenimento (filmes, séries) e histórico. | `profileId` |
| `wishlists` | Listas de desejos e itens. | `profileId` |
| `labels` | Etiquetas/Categorias para transações. | `profileId` |

---

## Detalhes das Coleções

### 1. `profiles`
Documento raiz representando uma conta familiar ou de grupo.
- **ID**: Auto-gerado ou ID do Auth UID (dependendo da implementação de criação).
- **Campos Importantes**:
    - `name` (string): Nome do perfil.
    - `subprofiles` (Array of Object): Lista de membros/subperfis.
        - `id`, `name`, `status`, `customTheme`.
    - `savedThemes` (Array): Temas personalizados salvos pelo usuário.
    - `apportionmentMethod`: Método de divisão de despesas ('proportional', 'manual', etc.).

### 2. `transactions`
Armazena entradas e saídas financeiras.
- **ID**: Auto-gerado.
- **Campos Principais**:
    - `profileId` (string): Vínculo com o perfil pai.
    - `subprofileId` (string, opcional): Vínculo com um membro específico.
    - `description` (string).
    - `amount` / `planned`, `actual` (number): Valores.
    - `date` (string YYYY-MM-DD): Data de competência.
    - `type`: 'income' ou 'expense'.
    - `isShared` (boolean): Se a despesa é compartilhada.
    - `isApportioned` (boolean): Se faz parte de uma divisão de custos.
    - `seriesId` (string): Para parcelamentos.

### 3. `feedbacks`
Sistema de issue tracking interno.
- **ID**: Auto-gerado.
- **Campos**:
    - `profileId`: Origem do reporte.
    - `description`.
    - `type`: 'bug', 'feature', 'tech_debt', etc.
    - `priority`: 'low', 'medium', 'high'.
    - `status`: 'open', 'resolved'.
    - `path` (string): Rota onde o feedback foi criado (Context Awareness).
    - `isViewed` (boolean): Controle de notificação não lida.

### 4. `media_items`
Catálogo de entretenimento.
- **Campos**:
    - `title`, `type` ('movie', 'series').
    - `provider` ('Netflix', 'Prime', etc.).
    - `status`: 'to_watch', 'watched', 'in_progress'.
    - `ratings`: Map de avaliações por subperfil.
    - `profileId`.

### 5. `labels`
Categorias personalizadas.
- **Campos**:
    - `name`, `color`.
    - `profileId`.

---

## Regras de Segurança (Security Rules)

Atualmente, as regras estão configuradas para **Desenvolvimento/Restrito ao Auth**:

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Permite leitura/escrita em qualquer documento
      // DESDE QUE o usuário esteja autenticado no Firebase Auth.
      allow read, write: if request.auth != null;
    }
  }
}
```

> **Nota**: Em produção, recomenda-se refinar estas regras para garantir que um usuário só possa acessar documentos onde `resource.data.profileId == request.auth.uid` ou lógica equivalente de membresia.
