#!/usr/bin/env node
import { RagieClient } from '../lib/ragie-client';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import type { RagieDocument, RagieDocumentGet, RetrievalResponse, RetrievalChunk } from '../lib/types/ragie';

const client = new RagieClient(process.env['NEXT_PUBLIC_RAGIE_API_KEY'] || '');
const program = new Command();

async function listDocuments() {
  const spinner = ora('Listando documentos...').start();
  try {
    console.log('📚 Listando documentos...');
    const response = await client.searchDocuments('.');
    spinner.stop();
    
    const documents = response?.scoredChunks || [];
    
    if (documents.length === 0) {
      console.log(chalk.yellow('📋 0 documentos encontrados'));
      return;
    }

    // Agrupa por documentId para evitar duplicatas
    const uniqueDocs = new Map();
    documents.forEach((chunk: any) => {
      if (!uniqueDocs.has(chunk.documentId)) {
        uniqueDocs.set(chunk.documentId, {
          id: chunk.documentId,
          name: chunk.documentName,
          metadata: chunk.documentMetadata,
          score: chunk.score
        });
      }
    });

    console.log(chalk.green(`\n📚 ${uniqueDocs.size} documentos encontrados:\n`));
    uniqueDocs.forEach((doc: any) => {
      console.log(chalk.blue(`ID: ${doc.id}`));
      console.log(`Nome: ${doc.name}`);
      if (doc.metadata) {
        console.log('Metadata:', doc.metadata);
      }
      console.log(chalk.gray('-------------------'));
    });
  } catch (error) {
    spinner.fail('❌ Erro ao listar documentos');
    console.error(chalk.red(error));
  }
}

async function checkDocument(id: string) {
  const spinner = ora(`Verificando documento ${id}...`).start();
  try {
    const doc = await client.getDocument(id) as RagieDocumentGet;
    spinner.stop();
    
    console.log(chalk.green('\n📄 Documento encontrado:\n'));
    console.log(chalk.blue(`ID: ${doc.id}`));
    console.log(`Status: ${doc.status}`);
    if (doc.metadata) {
      console.log('Metadata:', doc.metadata);
    }
    if (doc.chunks?.length) {
      console.log('\nChunks:');
      doc.chunks.forEach(chunk => {
        console.log(`- ${chunk.content}`);
        if (chunk.metadata) {
          console.log('  Metadata:', chunk.metadata);
        }
      });
    }
  } catch (error) {
    spinner.fail('Erro ao verificar documento');
    console.error(chalk.red(error));
  }
}

async function deleteDocument(id: string) {
  const spinner = ora(`Deletando documento ${id}...`).start();
  try {
    await client.deleteDocument(id);
    spinner.succeed('Documento deletado com sucesso');
  } catch (error) {
    spinner.fail('Erro ao deletar documento');
    console.error(chalk.red(error));
  }
}

async function searchDocuments(query: string, filter?: string) {
  const spinner = ora(`Buscando documentos com query "${query}"...`).start();
  try {
    const filterObj = filter ? JSON.parse(filter) : {};
    const response = await client.searchDocuments(query, filterObj);
    spinner.stop();

    const results = (response as any).scoredChunks || [];

    if (results.length === 0) {
      console.log(chalk.yellow('Nenhum resultado encontrado'));
      return;
    }

    console.log(chalk.green(`\n🔍 ${results.length} resultados encontrados:\n`));
    results.forEach((chunk: any) => {
      console.log(chalk.blue(`ID do Documento: ${chunk.documentId}`));
      console.log(`Nome do Documento: ${chunk.documentName}`);
      if (chunk.score !== undefined) {
        console.log(`Score: ${chunk.score}`);
      }
      if (chunk.text) {
        console.log(`Conteúdo: ${chunk.text.substring(0, 200)}...`);
      }
      if (chunk.documentMetadata) {
        console.log('Metadata:', chunk.documentMetadata);
      }
      console.log(chalk.gray('-------------------'));
    });
  } catch (error) {
    spinner.fail('Erro na busca');
    console.error(chalk.red(error));
  }
}

program
  .name('ragie-monitor')
  .description('CLI para monitorar documentos no Ragie')
  .version('1.0.0');

program
  .command('list')
  .description('Lista todos os documentos')
  .action(listDocuments);

program
  .command('get')
  .description('Verifica um documento específico')
  .argument('<id>', 'ID do documento')
  .action(checkDocument);

program
  .command('delete')
  .description('Deleta um documento')
  .argument('<id>', 'ID do documento')
  .action(deleteDocument);

program
  .command('search')
  .description('Busca documentos')
  .argument('<query>', 'Query de busca')
  .option('-f, --filter <json>', 'Filtro em formato JSON')
  .action((query: string, options: { filter?: string }) => searchDocuments(query, options.filter));

program.parse(); 