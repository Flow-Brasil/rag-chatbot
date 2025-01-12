# Guia da API Ragie

## Configuração Inicial

Primeiro, configure sua chave de API como variável de ambiente:

```bash
export RAGIE_API_KEY=seu_token_aqui
```

## Upload de Documentos

### 1. Enviar Arquivo

```bash
curl -X POST https://api.ragie.ai/documents \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -H "Content-type: multipart/form-data" \
  -F 'metadata={"scope": "seu-escopo"}' \
  -F "file=@caminho/do/arquivo" \
  -F mode=fast
```

### 2. Enviar Conteúdo Raw

```bash
curl -X POST https://api.ragie.ai/documents/raw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -d '{
    "content": "seu conteúdo aqui",
    "metadata": {
      "scope": "seu-escopo"
    }
  }'
```

## Busca e Recuperação

### 1. Buscar Informações

```bash
curl -X POST https://api.ragie.ai/retrievals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -d '{
    "query": "sua pergunta aqui",
    "rerank": true,
    "filter": {
      "scope": "seu-escopo"
    }
  }'
```

### 2. Gerar Resposta

```bash
curl -X POST https://api.ragie.ai/tutorial/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -d '{
    "query": "sua pergunta aqui",
    "rerank": true,
    "filter": {
      "scope": "seu-escopo"
    }
  }'
```

## Gerenciamento de Documentos

### 1. Verificar Status do Documento

```bash
curl -X GET https://api.ragie.ai/documents/{document_id} \
  -H "Authorization: Bearer $RAGIE_API_KEY"
```

### 2. Deletar Documento

```bash
curl -X DELETE https://api.ragie.ai/documents/{document_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY"
```

### 3. Atualizar Metadados

```bash
curl -X PATCH https://api.ragie.ai/documents/{document_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -d '{
    "metadata": {
      "scope": "novo-escopo"
    }
  }'
```

## Status dos Documentos

Os documentos passam pelos seguintes estados durante o processamento:

1. `pending` - Aguardando processamento
2. `partitioning` - Dividindo o documento
3. `partitioned` - Documento dividido
4. `refined` - Refinado
5. `chunked` - Dividido em chunks
6. `indexed` - Indexado (pode ser usado para busca)
7. `summary_indexed` - Sumário indexado
8. `ready` - Pronto para uso
9. `failed` - Falha no processamento

**Nota**: O documento está disponível para busca quando atinge o estado `indexed`, mas o sumário só estará disponível nos estados `summary_indexed` ou `ready`.
