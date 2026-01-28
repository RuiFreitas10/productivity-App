# Personal Assistant App - Supabase Setup

## Prerequisites
- Conta no Supabase (supabase.com)
- Supabase CLI instalado (opcional, mas recomendado)

## Setup Steps

### 1. Criar Projeto no Supabase

1. Aceda a [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Guarde o **Project URL** e a **anon/public key**

### 2. Configurar Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite `.env` e adicione as suas credenciais:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
OPENAI_API_KEY=sua_openai_key_aqui
```

### 3. Executar Migrações SQL

No Supabase Dashboard:

1. Vá para **SQL Editor**
2. Execute os ficheiros na seguinte ordem:

#### Passo 1: Schema Inicial
Copie e execute o conteúdo de:
```
supabase/migrations/001_initial_schema.sql
```

#### Passo 2: RLS Policies
Copie e execute o conteúdo de:
```
supabase/migrations/002_rls_policies.sql
```

#### Passo 3: Seed Data (Categorias)
Copie e execute o conteúdo de:
```
supabase/seed/categories.sql
```

### 4. Configurar Storage

No Supabase Dashboard:

1. Vá para **Storage**
2. Crie um novo bucket chamado `receipts`
3. Configure o bucket como **privado**
4. Adicione as seguintes políticas de Storage:

#### Policy 1: Upload de Receipts
```sql
CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 2: View Own Receipts
```sql
CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Policy 3: Delete Own Receipts
```sql
CREATE POLICY "Users can delete own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 5. Ativar Email Auth

No Supabase Dashboard:

1. Vá para **Authentication** → **Providers**
2. Certifique-se que **Email** está ativado
3. (Opcional) Configure **Email Templates** para personalizar os emails

### 6. (Opcional) Edge Functions

Para as funcionalidades de AI (OCR de faturas e AI Coach), será necessário criar Edge Functions:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref seu-projeto-ref

# Deploy functions (quando estiverem prontas)
supabase functions deploy extract-receipt
supabase functions deploy ai-query
```

## Verificação

Para verificar se tudo está configurado:

1. Execute a app: `npm start`
2. Crie uma nova conta
3. Verifique que:
   - ✅ A conta foi criada em `Authentication` → `Users`
   - ✅ Um perfil foi criado em `Table Editor` → `profiles`
   - ✅ Todas as tabelas existem
   - ✅ As políticas RLS estão ativas

## Estrutura de Tabelas

- `profiles` - Perfis de utilizadores
- `categories` - Categorias de despesas
- `receipts` - Imagens de faturas
- `expenses` - Despesas registadas
- `events` - Eventos do calendário
- `tasks` - Tarefas
- `reminders` - Lembretes
- `goals` - Objetivos
- `goal_tasks` - Sub-tarefas de objetivos
- `habits` - Hábitos diários
- `habit_logs` - Registos de hábitos
- `ai_insights` - Insights gerados pela AI
- `ai_chat_history` - Histórico de chat com AI

## Troubleshooting

### Erro de autenticação
- Verifique se as credenciais no `.env` estão corretas
- Confirme que o Email Auth está ativado

### Erro ao criar despesas
- Verifique se as RLS policies foram aplicadas
- Confirme que as categorias default foram inseridas

### Storage não funciona
- Verifique se o bucket `receipts` foi criado
- Confirme que as políticas de storage foram aplicadas
