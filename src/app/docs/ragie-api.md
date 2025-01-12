# Guia da API Ragie

## Configuração

Para usar a API Ragie, você precisa configurar sua chave de API como uma variável de ambiente:

```bash
export RAGIE_API_KEY=seu_token_aqui
```

## Upload de Documentos

### Upload de Arquivo

Para fazer upload de um arquivo:

```bash
curl -X POST https://api.ragie.tech/documents \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -F "file=@seu_arquivo.pdf" \
  -F "metadata={\"scope\":\"seu-escopo\"}" \
  -F "mode=fast"
```

### Upload de Conteúdo Raw

Para fazer upload de conteúdo raw:

```bash
curl -X POST https://api.ragie.tech/documents/raw \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "seu conteúdo aqui",
    "metadata": {
      "scope": "seu-escopo"
    }
  }'
```

## Busca de Informações

Para buscar informações nos documentos:

```bash
curl -X POST https://api.ragie.tech/retrievals \
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

## Geração de Respostas

Para gerar respostas baseadas em documentos:

```bash
curl -X POST https://api.ragie.tech/tutorial/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -d '{
    "query": "sua pergunta aqui",
    "context": "contexto opcional",
    "filter": {
      "scope": "seu-escopo"
    }
  }'
```

## Gerenciamento de Documentos

### Status do Documento

Para verificar o status de um documento:

```bash
curl -X GET https://api.ragie.tech/documents/{document_id} \
  -H "Authorization: Bearer $RAGIE_API_KEY"
```

### Deletar Documento

Para deletar um documento:

```bash
curl -X DELETE https://api.ragie.tech/documents/{document_id} \
  -H "Authorization: Bearer $RAGIE_API_KEY"
```

### Atualizar Metadados

Para atualizar os metadados de um documento:

```bash
curl -X PATCH https://api.ragie.tech/documents/{document_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -d '{
    "metadata": {
      "scope": "novo-escopo"
    }
  }'
```

## Estados dos Documentos

Um documento pode estar em um dos seguintes estados:

- `pending`: Documento recebido, aguardando processamento
- `partitioning`: Documento está sendo dividido em chunks
- `partitioned`: Documento foi dividido em chunks com sucesso
- `indexing`: Chunks estão sendo indexados
- `indexed`: Documento está pronto para busca
- `failed`: Ocorreu um erro no processamento

O documento está disponível para busca quando atinge o estado `indexed`.
