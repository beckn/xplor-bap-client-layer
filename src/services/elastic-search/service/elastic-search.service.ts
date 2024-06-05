import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
@Injectable()
export class ElasticSearchService {
  private readonly logger = new Logger(ElasticSearchService.name);
  // private readonly elasticsearchService: ElasticsearchService;
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndexIfNotExists(index: string): Promise<any> {
    const indexExists = await this.elasticsearchService.indices.exists({ index });

    if (!indexExists) {
      // Index does not exist, create it
      return await this.elasticsearchService.indices.create({ index });
    } else {
      // Index already exists
      return { acknowledged: true };
    }
  }
  // Create a document
  async create(index: string, id: string, document: any): Promise<any> {
    await this.createIndexIfNotExists(index);
    return await this.elasticsearchService.index({
      index,
      id,
      body: document,
    });
  }

  // Read a document by ID
  async read(index: string, id: string): Promise<any> {
    return await this.elasticsearchService.get({
      index,
      id,
    });
  }

  // Update a document by ID
  async update(index: string, id: string, document: any): Promise<any> {
    return await this.elasticsearchService.update({
      index,
      id,
      body: {
        doc: document,
      },
    });
  }

  // Delete a document by ID
  async delete(index: string, id: string): Promise<any> {
    return await this.elasticsearchService.delete({
      index,
      id,
    });
  }

  // Search documents
  async search(searchQuery: string): Promise<any[]> {
    const esResults = await this.elasticsearchService.search({
      index: 'items',
      body: {
        query: {
          match: { name: searchQuery },
        },
      },
    });

    const itemIds = esResults.hits.hits as { _source: { id: string } }[];
    return itemIds;
  }
}
